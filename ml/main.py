import joblib
import pandas as pd
import numpy as np
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# Suppress scikit-learn version warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

# --- 1. Load the saved components ---
print("Loading model components from disk...")
try:
    model = joblib.load('water_quality_model_final.joblib')
    scaler = joblib.load('scaler_final.joblib')
    feature_cols = joblib.load('feature_cols_final.joblib')
    print("✅ Components loaded successfully.")
except FileNotFoundError:
    print("❌ Error: Model files not found. Please run the training script first to create them.")
    exit()


# --- 2. Define the CORRECTED prediction function ---
def predict_with_confidence(model, scaler, new_data, feature_cols, confidence_threshold=0.65):
    """
    Makes a prediction and shows the specific diseases related to the predicted class.
    """
    # Prepare sample data
    sample_df = pd.DataFrame(new_data, index=[0])
    sample_df = sample_df[feature_cols]
    
    # Scale the sample
    sample_scaled = scaler.transform(sample_df)
    
    # Make prediction
    predicted_class = model.predict(sample_scaled)[0]
    predicted_proba = model.predict_proba(sample_scaled)[0]
    confidence = np.max(predicted_proba) * 100
    
    # Convert to binary representation
    binary_code = f'{predicted_class:08b}'
    
    print(f"\nPredicted Class: {predicted_class} (Confidence: {confidence:.2f}%)")
    print(f"Binary Representation: {binary_code}")

    # Map binary code to diseases from the paper
    print("\nAssociated Health Risks:")
    
    # This dictionary is based on Table 3 from the research paper
    risk_map = {
        'A': "Gastrointestinal diseases (e.g., cholera, diarrhea)",
        'B': "Kidney diseases",
        'C': "Dental problems (Fluorosis, corrosion)",
        'D': "Cardiovascular problems or Diabetes",
        'E': "Metabolic alkalosis",
        'F': "Convulsions (from Ammonia)",
        'G': "Bladder cancer (from Chlorides)",
        'H': "Blood disorders (Methemoglobinemia from Nitrates)"
    }
    
    has_risks = False
    # Iterate through the binary code (e.g., '10100000')
    for i, bit in enumerate(binary_code):
        if bit == '1':
            # Convert position (0, 1, 2...) to letter ('A', 'B', 'C'...)
            class_letter = chr(ord('A') + i)
            disease_info = risk_map.get(class_letter, "Unknown Risk")
            print(f"  - Class {class_letter}: {disease_info}")
            has_risks = True
            
    if not has_risks:
        print("  - None (Likely Safe for Consumption)")


# --- 3. Make a new prediction ---
print("\n--- Predicting a new water sample ---")

# Define a new water sample to test
borderline_water = {
    'ph_value': [6.4],
    'turbidity_value': [4.5],
    'ammonia_nitrogen_value': [1.0],
    'nitrate_nitrogen_value': [8.0],
    'total_coliform_value': [0.0],
    'calcium_value': [100.0],
    'chloride_value': [200.0],
    'fluoride_value': [1.6],
    'phosphate_phosphorus_value': [0.3],
    'potassium_value': [10.0],
    'sodium_value': [150.0],
    'sulphate_value': [200.0],
    'total_alkalinity_value': [250.0],
    'total_dissolved_solids_value': [450.0],
    'total_hardness_value': [250.0],
    'total_suspended_solids_value': [45.0]
}

# Use the loaded components to make the prediction
predict_with_confidence(model, scaler, borderline_water, feature_cols)