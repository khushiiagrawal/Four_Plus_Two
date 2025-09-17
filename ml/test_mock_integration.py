"""
Test script to demonstrate the mock data integration with ML model
"""

import requests
import json
from mock_data_generator import MockDataGenerator

def test_mock_data_generator():
    """Test the mock data generator directly"""
    print("=== Testing Mock Data Generator ===")
    generator = MockDataGenerator()
    
    # Test high risk conditions
    print("\n--- High Risk Conditions (Humidity: 85%, Temperature: 38°C) ---")
    high_risk_data = generator.generate_water_quality_data(85.0, 38.0)
    is_contaminated, reason = generator.get_condition_summary(85.0, 38.0)
    print(f"Condition: {reason}")
    print(f"pH: {high_risk_data.ph_value:.2f}")
    print(f"Turbidity: {high_risk_data.turbidity_value:.2f}")
    print(f"Ammonia: {high_risk_data.ammonia_nitrogen_value:.2f}")
    print(f"Nitrate: {high_risk_data.nitrate_nitrogen_value:.2f}")
    print(f"Coliform: {high_risk_data.total_coliform_value:.2f}")
    
    # Test normal conditions
    print("\n--- Normal Conditions (Humidity: 60%, Temperature: 25°C) ---")
    normal_data = generator.generate_water_quality_data(60.0, 25.0)
    is_normal, reason = generator.get_condition_summary(60.0, 25.0)
    print(f"Condition: {reason}")
    print(f"pH: {normal_data.ph_value:.2f}")
    print(f"Turbidity: {normal_data.turbidity_value:.2f}")
    print(f"Ammonia: {normal_data.ammonia_nitrogen_value:.2f}")
    print(f"Nitrate: {normal_data.nitrate_nitrogen_value:.2f}")
    print(f"Coliform: {normal_data.total_coliform_value:.2f}")

def test_ml_api_endpoints(base_url="http://localhost:8000"):
    """Test the ML API endpoints"""
    print("\n=== Testing ML API Endpoints ===")
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health Check failed: {e}")
        return
    
    # Test simple alert endpoint
    print("\n--- Testing Simple Alert Endpoint ---")
    try:
        response = requests.post(f"{base_url}/alert", json={
            "humidity": 85.0,
            "temperature_celsius": 38.0
        })
        print(f"Alert Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Alert endpoint failed: {e}")
    
    # Test comprehensive sensor analysis endpoint
    print("\n--- Testing Comprehensive Sensor Analysis ---")
    try:
        response = requests.post(f"{base_url}/sensor-analysis", json={
            "humidity": 85.0,
            "temperature_celsius": 38.0
        })
        print(f"Analysis Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Is High Risk: {data['isHigh']}")
            print(f"Reason: {data['reason']}")
            print(f"Severity: {data['severity']}")
            print(f"Health Risks Summary: {data['health_risks_summary']}")
            print(f"Environmental Conditions: {json.dumps(data['environmental_conditions'], indent=2)}")
            print(f"Water Quality Prediction: {json.dumps(data['water_quality_prediction'], indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Sensor analysis endpoint failed: {e}")
    
    # Test with normal conditions
    print("\n--- Testing with Normal Conditions ---")
    try:
        response = requests.post(f"{base_url}/sensor-analysis", json={
            "humidity": 60.0,
            "temperature_celsius": 25.0
        })
        print(f"Normal Conditions Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Is High Risk: {data['isHigh']}")
            print(f"Reason: {data['reason']}")
            print(f"Severity: {data['severity']}")
            print(f"Health Risks Summary: {data['health_risks_summary']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Normal conditions test failed: {e}")

def test_frontend_integration(base_url="http://localhost:3000"):
    """Test the frontend sensor ingest endpoint"""
    print("\n=== Testing Frontend Integration ===")
    
    # Test high risk sensor reading
    print("\n--- Testing High Risk Sensor Reading ---")
    try:
        response = requests.post(f"{base_url}/api/sensor/ingest", json={
            "humidity": 85.0,
            "temperature_celsius": 38.0,
            "timestamp_ist": "2025-01-16 21:37:29 IST",
            "timestamp_unix": 1737040049
        })
        print(f"Frontend Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data['ok']}")
            print(f"Decision: {json.dumps(data['decision'], indent=2)}")
            if 'alertId' in data:
                print(f"Alert ID: {data['alertId']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Frontend integration test failed: {e}")
    
    # Test normal sensor reading
    print("\n--- Testing Normal Sensor Reading ---")
    try:
        response = requests.post(f"{base_url}/api/sensor/ingest", json={
            "humidity": 60.0,
            "temperature_celsius": 25.0,
            "timestamp_ist": "2025-01-16 21:37:29 IST",
            "timestamp_unix": 1737040049
        })
        print(f"Frontend Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data['ok']}")
            print(f"Decision: {json.dumps(data['decision'], indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Normal conditions frontend test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Mock Data Integration Tests")
    
    # Test mock data generator
    test_mock_data_generator()
    
    # Test ML API endpoints
    test_ml_api_endpoints()
    
    # Test frontend integration
    test_frontend_integration()
    
    print("\n✅ All tests completed!")
