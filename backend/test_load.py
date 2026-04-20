import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
sys.path.insert(0, os.path.dirname(__file__))

import model as M
import numpy as np

m = M.load_model()
dummy = np.zeros((1, m.input_shape[1], m.input_shape[1], 3), dtype="float32")
out = m.predict(dummy, verbose=0)[0]

print(f"model_type  : {M._model_type}")
print(f"input_shape : {m.input_shape}")
print(f"output_shape: {m.output_shape}")
print(f"NUM_CLASSES : {M.NUM_CLASSES}")
print(f"prob_sum    : {round(float(out.sum()), 6)}")
print(f"top_pred    : {M.CLASS_LABELS[int(np.argmax(out))]} ({np.max(out)*100:.1f}%)")

assert m.output_shape[-1] == 38, f"FAIL: output has {m.output_shape[-1]} classes, need 38"
assert abs(out.sum() - 1.0) < 1e-3, f"FAIL: probs sum to {out.sum()}"
print("\n✅ Model OK — ready to serve predictions")
