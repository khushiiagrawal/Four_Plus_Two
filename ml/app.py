from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
import os
import warnings
from sklearn.exceptions import InconsistentVersionWarning
from typing import Dict, List

# Suppress scikit-learn version warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

app = FastAPI(
    title="Water Quality Prediction API",
    description="API for predicting water quality and associated health risks",
    version="1.0.0"
)

# Global variables for model components
model = None
scaler = None
feature_cols = None

class WaterSample(BaseModel):
    ph_value: float = Field(..., description="pH value of water", ge=0, le=14)
    turbidity_value: float = Field(..., description="Turbidity value", ge=0)
    ammonia_nitrogen_value: float = Field(..., description="Ammonia nitrogen content", ge=0)
    nitrate_nitrogen_value: float = Field(..., description="Nitrate nitrogen content", ge=0)
    total_coliform_value: float = Field(..., description="Total coliform count", ge=0)
    calcium_value: float = Field(..., description="Calcium content", ge=0)
    chloride_value: float = Field(..., description="Chloride content", ge=0)
    fluoride_value: float = Field(..., description="Fluoride content", ge=0)
    phosphate_phosphorus_value: float = Field(..., description="Phosphate phosphorus content", ge=0)
    potassium_value: float = Field(..., description="Potassium content", ge=0)
    sodium_value: float = Field(..., description="Sodium content", ge=0)
    sulphate_value: float = Field(..., description="Sulphate content", ge=0)
    total_alkalinity_value: float = Field(..., description="Total alkalinity", ge=0)
    total_dissolved_solids_value: float = Field(..., description="Total dissolved solids", ge=0)
    total_hardness_value: float = Field(..., description="Total hardness", ge=0)
    total_suspended_solids_value: float = Field(..., description="Total suspended solids", ge=0)

class PredictionResponse(BaseModel):
    predicted_class: int
    confidence: float
    binary_representation: str
    health_risks: List[str]
    is_safe: bool

class AlertSample(BaseModel):
    humidity: float
    temperature_celsius: float

class AlertDecision(BaseModel):
    isHigh: bool
    reason: str

@app.on_event("startup")
async def load_model():
    """Load model components on startup"""
    global model, scaler, feature_cols
    
    try:
        print("Loading model components from disk...")
        model = joblib.load('water_quality_model_final.joblib')
        scaler = joblib.load('scaler_final.joblib')
        feature_cols = joblib.load('feature_cols_final.joblib')
        print("✅ Components loaded successfully.")
    except FileNotFoundError as e:
        print(f"❌ Error: Model files not found. {e}")
        raise RuntimeError("Model files not found. Please ensure model files are present.")

def predict_water_quality(sample_data: dict) -> dict:
    """
    Makes a prediction and returns health risks associated with the predicted class.
    """
    # Prepare sample data
    sample_df = pd.DataFrame(sample_data, index=[0])
    sample_df = sample_df[feature_cols]
    
    # Scale the sample
    sample_scaled = scaler.transform(sample_df)
    
    # Make prediction
    predicted_class = model.predict(sample_scaled)[0]
    predicted_proba = model.predict_proba(sample_scaled)[0]
    confidence = np.max(predicted_proba) * 100
    
    # Convert to binary representation
    binary_code = f'{predicted_class:08b}'
    
    # Map binary code to diseases from the research paper
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
    
    health_risks = []
    # Iterate through the binary code
    for i, bit in enumerate(binary_code):
        if bit == '1':
            class_letter = chr(ord('A') + i)
            disease_info = risk_map.get(class_letter, "Unknown Risk")
            health_risks.append(f"Class {class_letter}: {disease_info}")
    
    is_safe = len(health_risks) == 0
    
    return {
        "predicted_class": int(predicted_class),
        "confidence": round(confidence, 2),
        "binary_representation": binary_code,
        "health_risks": health_risks,
        "is_safe": is_safe
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Water Quality Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict - POST endpoint for water quality prediction",
            "health": "/health - GET endpoint for health check",
            "docs": "/docs - Interactive API documentation"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_loaded = model is not None and scaler is not None and feature_cols is not None
    return {
        "status": "healthy" if model_loaded else "unhealthy",
        "model_loaded": model_loaded
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_water_quality_endpoint(water_sample: WaterSample):
    """
    Predict water quality and associated health risks based on water parameters
    """
    if model is None or scaler is None or feature_cols is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please check server logs.")
    
    try:
        # Convert Pydantic model to dict
        sample_data = water_sample.dict()
        
        # Make prediction
        result = predict_water_quality(sample_data)
        
        return PredictionResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/alert", response_model=AlertDecision)
async def alert_decision(sample: AlertSample):
    """
    Decide if a sensor reading (temp/humidity) is high.
    This provides a consistent ML service surface for Cloud Functions.
    Replace the simple rule below with an actual model if desired.
    """
    try:
        temp_high_c = float(os.getenv("TEMP_HIGH_C", 38))
        humidity_high_pct = float(os.getenv("HUMIDITY_HIGH_PCT", 80))
    except Exception:
        temp_high_c = 38.0
        humidity_high_pct = 80.0

    reasons: List[str] = []
    if sample.temperature_celsius >= temp_high_c:
        reasons.append(f"Temperature too high: {sample.temperature_celsius}°C ≥ {temp_high_c}°C")
    if sample.humidity >= humidity_high_pct:
        reasons.append(f"Humidity too high: {sample.humidity}% ≥ {humidity_high_pct}%")

    is_high = len(reasons) > 0
    return AlertDecision(isHigh=is_high, reason="; ".join(reasons) or "Within normal range")

@app.get("/sample")
async def get_sample_data():
    """Get sample water data for testing"""
    return {
        "sample_water": {
            "ph_value": 6.4,
            "turbidity_value": 4.5,
            "ammonia_nitrogen_value": 1.0,
            "nitrate_nitrogen_value": 8.0,
            "total_coliform_value": 0.0,
            "calcium_value": 100.0,
            "chloride_value": 200.0,
            "fluoride_value": 1.6,
            "phosphate_phosphorus_value": 0.3,
            "potassium_value": 10.0,
            "sodium_value": 150.0,
            "sulphate_value": 200.0,
            "total_alkalinity_value": 250.0,
            "total_dissolved_solids_value": 450.0,
            "total_hardness_value": 250.0,
            "total_suspended_solids_value": 45.0
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)