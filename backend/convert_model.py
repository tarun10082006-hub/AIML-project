#!/usr/bin/env python3
"""
Model conversion script for Keras 3.x compatibility
Run this if you have the original model training environment
"""

import os
os.environ['TF_USE_LEGACY_KERAS'] = '0'

try:
    import tensorflow as tf
    
    # Load the problematic model
    model_path = "model/model.h5"  # or model.keras
    model = tf.keras.models.load_model(model_path)
    
    # Save in compatible format
    model.save("model/model_fixed.h5", save_format='h5')
    print("✅ Model converted successfully to model_fixed.h5")
    
    # Test loading
    test_model = tf.keras.models.load_model("model/model_fixed.h5")
    print("✅ Converted model loads successfully")
    
except Exception as e:
    print(f"❌ Conversion failed: {e}")
    print("\n💡 Alternative: Retrain your model with current TensorFlow version")