import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the server is running.")
        return False

def test_sample_endpoint():
    """Test the sample data endpoint"""
    print("\nTesting sample endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/sample")
        print(f"Status Code: {response.status_code}")
        sample_data = response.json()
        print(f"Sample data received: {json.dumps(sample_data, indent=2)}")
        return sample_data.get("sample_water")
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_predict_endpoint(sample_data):
    """Test the prediction endpoint with sample data"""
    print("\nTesting prediction endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=sample_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful!")
            print(f"Predicted Class: {result['predicted_class']}")
            print(f"Confidence: {result['confidence']}%")
            print(f"Binary Representation: {result['binary_representation']}")
            print(f"Is Safe: {result['is_safe']}")
            print("Health Risks:")
            if result['health_risks']:
                for risk in result['health_risks']:
                    print(f"  - {risk}")
            else:
                print("  - None (Water appears safe)")
        else:
            print(f"❌ Prediction failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("🧪 Testing Water Quality Prediction API")
    print("=" * 50)
    
    # Test health endpoint
    if not test_health_endpoint():
        print("\n❌ Server is not running or not healthy.")
        print("Please start the server with: python -m uvicorn app:app --host 0.0.0.0 --port 8000")
        return
    
    # Test sample endpoint
    sample_data = test_sample_endpoint()
    if not sample_data:
        print("❌ Could not get sample data")
        return
    
    # Test prediction endpoint
    test_predict_endpoint(sample_data)
    
    print("\n" + "=" * 50)
    print("🎉 API testing completed!")

if __name__ == "__main__":
    main()