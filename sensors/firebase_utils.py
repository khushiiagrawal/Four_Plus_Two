import os
import time
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from config import FIREBASE_KEYS

# Load environment variables
load_dotenv()

def initialize_firebase():
    """Initialize Firebase connection."""
    FIREBASE_CREDENTIALS_FILE = os.getenv('FIREBASE_CREDENTIALS_FILE', 'service_account_key.json')
    FIREBASE_DATABASE_URL = os.getenv('FIREBASE_DATABASE_URL')
    
    if not FIREBASE_DATABASE_URL:
        raise ValueError("FIREBASE_DATABASE_URL not found in environment variables")
    
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_FILE)
    firebase_admin.initialize_app(cred, {
        'databaseURL': FIREBASE_DATABASE_URL
    })

def get_firebase_ref(data_type='continuous'):
    """Get Firebase reference for specific data type."""
    if data_type not in FIREBASE_KEYS:
        raise ValueError(f"Invalid data type: {data_type}. Must be one of {list(FIREBASE_KEYS.keys())}")
    
    return db.reference(FIREBASE_KEYS[data_type])

def _get_ist_time():
    """Get current IST time."""
    ist = timezone(timedelta(hours=5, minutes=30))  # IST is UTC+5:30
    return datetime.now(ist)

def create_data_packet(humidity, temperature):
    """Create a standardized data packet with timestamp."""
    current_time_ist = _get_ist_time()
    
    return {
        'humidity': float(humidity),
        'temperature_celsius': float(temperature),
        'timestamp_ist': current_time_ist.strftime('%Y-%m-%d %H:%M:%S IST'),
        'timestamp_unix': int(current_time_ist.timestamp())
    }

def create_readable_key():
    """Create a readable key using IST timestamp."""
    current_time_ist = _get_ist_time()
    return f"sensor_{current_time_ist.strftime('%Y%m%d_%H%M%S')}"

def read_sensor_data_from_arduino(arduino_connection):
    """Read sensor data from Arduino connection."""
    try:
        # Clear buffer and wait for fresh data
        arduino_connection.flushInput()
        time.sleep(1)
        
        # Read sensor data with longer timeout
        line = arduino_connection.readline().decode('utf-8').strip()
        
        # If no data or not sensor data, wait longer and try again
        if not line or ',' not in line:
            time.sleep(5)  # Wait longer for Arduino to send data
            line = arduino_connection.readline().decode('utf-8').strip()
        
        if line and ',' in line:
            humidity, temperature = line.split(',')
            return float(humidity), float(temperature), None
        else:
            return None, None, f"No valid sensor data received (got: '{line}')"
            
    except Exception as e:
        return None, None, f"Error reading sensor: {str(e)}"

def send_to_firebase(data_type, humidity, temperature):
    """Send sensor data to Firebase with specified data type."""
    try:
        ref = get_firebase_ref(data_type)
        data_packet = create_data_packet(humidity, temperature)
        readable_key = create_readable_key()
        
        ref.child(readable_key).set(data_packet)
        print(f"Data sent to Firebase ({data_type}): {data_packet}")
        return True
    except Exception as e:
        print(f"Error sending to Firebase ({data_type}): {e}")
        return False
