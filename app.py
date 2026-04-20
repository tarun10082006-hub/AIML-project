import os
import io
import numpy as np
import tensorflow as tf
from flask import Flask, request, render_template
from PIL import Image

_orig_dw_init = tf.keras.layers.DepthwiseConv2D.__init__
def _patched_dw_init(self, *args, **kwargs):
    kwargs.pop("groups", None)
    _orig_dw_init(self, *args, **kwargs)
tf.keras.layers.DepthwiseConv2D.__init__ = _patched_dw_init

app = Flask(__name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
CONFIDENCE_THRESHOLD = 0.6
CLASS_LABELS = ["Healthy", "Diseased"]

model = tf.keras.models.load_model("backend/model/model.h5", compile=False)


def predict_image(file_bytes):
    _, h, w, _ = model.input_shape
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB").resize((w, h))
    arr = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)
    preds = model.predict(arr, verbose=0)[0]
    confidence = float(np.max(preds))
    if confidence < CONFIDENCE_THRESHOLD:
        return "Uncertain — please upload a clearer plant leaf image"
    return CLASS_LABELS[int(np.argmax(preds))]


@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    if request.method == "POST":
        f = request.files.get("image")
        ext = f.filename.rsplit(".", 1)[-1].lower() if f and "." in f.filename else ""
        if f and ext in ALLOWED_EXTENSIONS:
            result = predict_image(f.read())
        else:
            result = "Invalid file type. Please upload a valid image."
    return render_template("index.html", result=result)


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
