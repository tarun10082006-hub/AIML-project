import os
import io
import base64
import numpy as np
import tensorflow as tf
import cv2
from PIL import Image, ImageEnhance

# ── 38 classes — full PlantVillage order (alphabetical, matches dataset folders) ──
CLASS_LABELS = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry___Powdery_mildew", "Cherry___healthy",
    "Corn___Cercospora_leaf_spot", "Corn___Common_rust", "Corn___Northern_Leaf_Blight", "Corn___healthy",
    "Grape___Black_rot", "Grape___Esca", "Grape___Leaf_blight", "Grape___healthy",
    "Orange___Haunglongbing",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
]

INPUT_SIZE = 224
CONFIDENCE_THRESHOLD = 0.60   # raised: below this → rejected
NUM_CLASSES = len(CLASS_LABELS)  # 38
ENSEMBLE_AUGMENTS = 3  # original + flip + brightness

_model = None
_model_type = None  # "efficientnet" | "mobilenet" | "legacy"


# ── Model architecture builders ────────────────────────────────────────────────

def _build_efficientnet(n: int = NUM_CLASSES):
    base = tf.keras.applications.EfficientNetV2S(
        input_shape=(INPUT_SIZE, INPUT_SIZE, 3), include_top=False, weights=None
    )
    x = tf.keras.layers.GlobalAveragePooling2D()(base.output)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(n, activation="softmax")(x)
    return tf.keras.Model(base.input, out)


def _build_mobilenet(n: int = NUM_CLASSES):
    base = tf.keras.applications.MobileNetV2(
        input_shape=(INPUT_SIZE, INPUT_SIZE, 3), include_top=False, weights=None
    )
    x = tf.keras.layers.GlobalAveragePooling2D()(base.output)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(n, activation="softmax")(x)
    return tf.keras.Model(base.input, out)


# ── Model loader ───────────────────────────────────────────────────────────────

def load_model():
    global _model, _model_type
    if _model is not None:
        return _model

    model_dir   = os.path.join(os.path.dirname(__file__), "model")
    keras_path  = os.path.join(model_dir, "best_model.keras")
    h5_path     = os.path.join(model_dir, "best_model.h5")
    legacy_path = os.path.join(model_dir, "model.h5")

    # 1. EfficientNetV2S — .keras (best)
    if os.path.exists(keras_path):
        try:
            _model = tf.keras.models.load_model(keras_path)
            _model_type = "efficientnet"
            print("[model] Loaded EfficientNetV2S from best_model.keras")
            return _model
        except Exception as e:
            print(f"[model] best_model.keras failed ({e}), trying weights-only…")
            try:
                _model = _build_efficientnet()
                _model.load_weights(keras_path)
                _model_type = "efficientnet"
                return _model
            except Exception as e2:
                print(f"[model] EfficientNet weights failed ({e2})")

    # 2. MobileNetV2 — .h5
    if os.path.exists(h5_path):
        try:
            _model = tf.keras.models.load_model(h5_path)
            _model_type = "mobilenet"
            print("[model] Loaded MobileNetV2 from best_model.h5")
            return _model
        except Exception as e:
            print(f"[model] best_model.h5 failed ({e}), trying weights-only…")
            try:
                _model = _build_mobilenet()
                _model.load_weights(h5_path)
                _model_type = "mobilenet"
                return _model
            except Exception as e2:
                print(f"[model] MobileNetV2 weights failed ({e2})")

    # 3. model.h5 — Keras 2.x legacy CNN
    # Keras 3 load_weights is incompatible with Keras 2 h5 format.
    # Load weight arrays directly via h5py and assign manually.
    if not os.path.exists(legacy_path):
        raise FileNotFoundError(f"No model found in {model_dir}")

    import h5py
    with h5py.File(legacy_path, "r") as wf:
        wg = wf["model_weights"]
        # Read exact shapes to build matching architecture
        k1 = wg["conv2d_1/conv2d_1/kernel:0"][()]   # (3,3,3,64)
        k2 = wg["conv2d_2/conv2d_2/kernel:0"][()]   # (3,3,64,64)
        d1 = wg["dense_1/dense_1/kernel:0"][()]     # (flat, 128)
        d2 = wg["dense_2/dense_2/kernel:0"][()]     # (128, 38)
        b1 = wg["conv2d_1/conv2d_1/bias:0"][()]
        b2 = wg["conv2d_2/conv2d_2/bias:0"][()]
        db1 = wg["dense_1/dense_1/bias:0"][()]
        db2 = wg["dense_2/dense_2/bias:0"][()]

    flat_size = d1.shape[0]  # e.g. 12544
    # Derive input size: flat = ((((in-2)//2 - 2)//2)^2) * 64
    import math
    spatial = int(math.sqrt(flat_size // k2.shape[-1]))  # e.g. 14

    m = tf.keras.Sequential([
        tf.keras.Input(shape=(64, 64, 3)),
        tf.keras.layers.Conv2D(k1.shape[-1], k1.shape[:2], activation="relu", padding="valid"),
        tf.keras.layers.MaxPooling2D(2, 2),
        tf.keras.layers.Conv2D(k2.shape[-1], k2.shape[:2], activation="relu", padding="valid"),
        tf.keras.layers.MaxPooling2D(2, 2),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(d1.shape[-1], activation="relu"),
        tf.keras.layers.Dense(d2.shape[-1], activation="softmax"),
    ])
    # Build the model so layers have weights, then assign directly
    m.build((None, 64, 64, 3))
    # In Keras 3, Input is not a layer — conv/pool/flatten/dense are indices 0,1,2,3,4,5,6
    conv_layers  = [l for l in m.layers if isinstance(l, tf.keras.layers.Conv2D)]
    dense_layers = [l for l in m.layers if isinstance(l, tf.keras.layers.Dense)]
    conv_layers[0].set_weights([k1, b1])
    conv_layers[1].set_weights([k2, b2])
    dense_layers[0].set_weights([d1, db1])
    dense_layers[1].set_weights([d2, db2])

    n_out = d2.shape[-1]
    if n_out != NUM_CLASSES:
        raise ValueError(
            f"model.h5 has {n_out} output classes but CLASS_LABELS has {NUM_CLASSES}."
        )
    _model = m
    _model_type = "legacy"
    print(f"[model] Loaded legacy 64x64 CNN ({n_out} classes) from model.h5")
    return _model


# ── Preprocessing pipeline ─────────────────────────────────────────────────────

def _apply_clahe(img_rgb: np.ndarray) -> np.ndarray:
    """Boost local contrast with CLAHE — helps with dark/overexposed leaf photos."""
    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)


def _crop_to_leaf(img_rgb: np.ndarray) -> np.ndarray:
    """
    Auto-crop to the largest green/leaf region using HSV masking + contour detection.
    Falls back to the original image if no clear leaf is found.
    """
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    # Green hue range (covers most leaf colours including yellowing)
    mask = cv2.inRange(hsv, np.array([20, 30, 30]), np.array([170, 255, 255]))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return img_rgb
    largest = max(contours, key=cv2.contourArea)
    area_ratio = cv2.contourArea(largest) / (img_rgb.shape[0] * img_rgb.shape[1])
    if area_ratio < 0.05:   # less than 5% of image — probably not a leaf
        return img_rgb
    x, y, w, h = cv2.boundingRect(largest)
    pad = 10
    x1 = max(0, x - pad); y1 = max(0, y - pad)
    x2 = min(img_rgb.shape[1], x + w + pad)
    y2 = min(img_rgb.shape[0], y + h + pad)
    return img_rgb[y1:y2, x1:x2]


def _is_likely_plant(img_rgb: np.ndarray) -> bool:
    """
    Reject images that have almost no green/plant pixels.
    Uses a tighter green range and requires at least 8% coverage.
    """
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    # Tighter green/yellow-green range — excludes skin tones and most backgrounds
    green_mask = cv2.inRange(hsv, np.array([25, 40, 40]), np.array([95, 255, 255]))
    green_ratio = np.count_nonzero(green_mask) / green_mask.size
    return green_ratio > 0.08   # at least 8% green pixels


def _preprocess(image_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    """
    Full preprocessing pipeline.
    Returns (model_input_array, display_rgb_array) — display array is 224×224 uint8.
    """
    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(pil, dtype=np.uint8)

    # 1. Auto-crop to leaf region
    img = _crop_to_leaf(img)

    # 2. CLAHE contrast enhancement
    img = _apply_clahe(img)

    # 3. Resize to model input — read actual size from loaded model
    if _model_type in ("efficientnet", "mobilenet"):
        size = INPUT_SIZE
    else:
        size = _model.input_shape[1]  # works for legacy (64) and binary (224)
    img_resized = cv2.resize(img, (size, size), interpolation=cv2.INTER_LANCZOS4)
    display = img_resized.copy()   # uint8 for Grad-CAM overlay

    arr = img_resized.astype(np.float32)
    if _model_type == "efficientnet":
        pass                          # EfficientNetV2 has built-in rescaling
    elif _model_type == "mobilenet":
        arr = (arr / 127.5) - 1.0    # MobileNetV2 expects [-1, 1]
    else:
        arr = arr / 255.0             # legacy CNN trained with [0, 1]

    return np.expand_dims(arr, axis=0), display


# ── Grad-CAM ───────────────────────────────────────────────────────────────────

def _get_last_conv_layer(model) -> str:
    """Find the last Conv2D layer name for Grad-CAM."""
    for layer in reversed(model.layers):
        if isinstance(layer, (tf.keras.layers.Conv2D,
                               tf.keras.layers.DepthwiseConv2D)):
            return layer.name
        # EfficientNet/MobileNet wrap layers in sub-models
        if hasattr(layer, 'layers'):
            for sub in reversed(layer.layers):
                if isinstance(sub, (tf.keras.layers.Conv2D,
                                     tf.keras.layers.DepthwiseConv2D)):
                    return sub.name
    return None


def generate_gradcam(image_bytes: bytes, class_idx: int) -> str:
    """
    Generate Grad-CAM heatmap for the predicted class.
    Returns a base64-encoded PNG of the heatmap overlaid on the original image.
    """
    model = load_model()
    arr, display_rgb = _preprocess(image_bytes)

    # Build a sub-model that outputs [last_conv_output, predictions]
    last_conv_name = _get_last_conv_layer(model)
    if last_conv_name is None:
        return ""

    # Find the layer — may be nested inside a sub-model
    conv_layer = None
    for layer in model.layers:
        if layer.name == last_conv_name:
            conv_layer = layer
            break
        if hasattr(layer, 'layers'):
            for sub in layer.layers:
                if sub.name == last_conv_name:
                    # Build output from the parent sub-model
                    conv_layer = layer
                    last_conv_name = layer.name
                    break

    if conv_layer is None:
        return ""

    grad_model = tf.keras.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(last_conv_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(arr, training=False)
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)[0]          # (H, W, C)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1))     # (C,)
    conv_out = conv_outputs[0]                             # (H, W, C)
    heatmap = conv_out @ pooled_grads[..., tf.newaxis]    # (H, W, 1)
    heatmap = tf.squeeze(heatmap).numpy()
    heatmap = np.maximum(heatmap, 0)
    if heatmap.max() > 0:
        heatmap /= heatmap.max()

    # Resize heatmap to display size and apply colour map
    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_resized = cv2.resize(heatmap_uint8, (INPUT_SIZE, INPUT_SIZE))
    heatmap_color = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    # Overlay on original display image
    overlay = cv2.addWeighted(display_rgb, 0.55, heatmap_color, 0.45, 0)
    _, buf = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buf).decode("utf-8")


# ── Ensemble augmentation helpers ─────────────────────────────────────────────

def _augment_variants(image_bytes: bytes) -> list[bytes]:
    """
    Produce ENSEMBLE_AUGMENTS byte variants: original + flip + brightness.
    Rotations removed — black fill corners hurt small-leaf accuracy.
    """
    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    variants = [image_bytes]

    buf = io.BytesIO()
    pil.transpose(Image.FLIP_LEFT_RIGHT).save(buf, format="JPEG", quality=95)
    variants.append(buf.getvalue())

    buf = io.BytesIO()
    ImageEnhance.Brightness(pil).enhance(1.1).save(buf, format="JPEG", quality=95)
    variants.append(buf.getvalue())

    return variants[:ENSEMBLE_AUGMENTS]


# ── Public predict API ─────────────────────────────────────────────────────────

def predict_image(image_bytes: bytes) -> dict:
    model = load_model()

    # Plant detection gate
    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    raw = np.array(pil, dtype=np.uint8)
    if not _is_likely_plant(raw):
        return {
            "label": "Not a plant image or unrecognized leaf",
            "confidence": 0.0,
            "top3": [],
            "rejected": True,
        }

    # ── Ensemble: run all augmented variants and average softmax outputs ──
    variants = _augment_variants(image_bytes)
    all_preds = []
    for v in variants:
        try:
            arr, _ = _preprocess(v)
            all_preds.append(model.predict(arr, verbose=0)[0])
        except Exception:
            pass  # skip a broken augment, don't crash

    if not all_preds:
        return {"label": "Not a plant image or unrecognized leaf", "confidence": 0.0, "top3": [], "rejected": True}

    # Geometric mean of probabilities — more robust than arithmetic mean for softmax
    log_avg = np.mean(np.log(np.clip(all_preds, 1e-9, 1.0)), axis=0)
    preds = np.exp(log_avg)
    preds /= preds.sum()  # renormalise

    confidence = float(np.max(preds))
    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "label": "Not a plant image or unrecognized leaf",
            "confidence": confidence,
            "top3": [],
            "rejected": True,
        }

    top3_idx = np.argsort(preds)[::-1][:3]
    top3 = [
        {"label": CLASS_LABELS[i] if i < len(CLASS_LABELS) else "Unknown",
         "confidence": round(float(preds[i]), 4)}
        for i in top3_idx
    ]
    return {
        "label": top3[0]["label"],
        "confidence": top3[0]["confidence"],
        "top3": top3,
        "class_idx": int(top3_idx[0]),
        "rejected": False,
        "ensemble_size": len(all_preds),
    }
