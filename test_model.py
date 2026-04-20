import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import numpy as np
import tensorflow as tf

_orig = tf.keras.layers.DepthwiseConv2D.__init__
def _patched(self, *args, **kwargs):
    kwargs.pop("groups", None)
    _orig(self, *args, **kwargs)
tf.keras.layers.DepthwiseConv2D.__init__ = _patched

m = tf.keras.models.load_model("backend/model/model.h5", compile=False)
out = m.predict(np.zeros((1, 224, 224, 3), dtype="float32"), verbose=0)
print("Output shape :", out.shape)
print("Probabilities:", out[0])
print("Sum of probs :", round(float(out[0].sum()), 4))
print("Predicted idx:", int(np.argmax(out[0])))
print("Confidence   :", round(float(np.max(out[0])), 4))
print("Labels       : ['Healthy', 'Diseased']")
print("✅ Model OK")
