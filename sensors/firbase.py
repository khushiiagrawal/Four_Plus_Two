import serial
import time
import os
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- FIREBASE SETUP ---
# Get Firebase configuration from environment variables
FIREBASE_CREDENTIALS_FILE = os.getenv('FIREBASE_CREDENTIALS_FILE', 'service_account_key.json')
FIREBASE_DATABASE_URL = os.getenv('FIREBASE_DATABASE_URL')

if not FIREBASE_DATABASE_URL:
    raise ValueError("FIREBASE_DATABASE_URL not found in environment variables")

cred = credentials.Certificate(FIREBASE_CREDENTIALS_FILE)
firebase_admin.initialize_app(cred, {
    'databaseURL': FIREBASE_DATABASE_URL
})

# Reference to the root of your database
ref = db.reference('sensor_data')

# --- SERIAL PORT SETUP ---
# Get serial configuration from environment variables
SERIAL_PORT = os.getenv('SERIAL_PORT', '/dev/cu.usbmodem101')
BAUD_RATE = int(os.getenv('BAUD_RATE', '9600'))

print("Starting the bridge script...")

try:
    # Connect to the serial port
    arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2) # Wait for the connection to establish

    while True:
        # Read one line of data from the Arduino
        line = arduino.readline().decode('utf-8').strip()

        # Check if the line contains data
        if line and ',' in line:
            print(f"Received from Arduino: {line}")
            
            try:
                # Split the data string into humidity and temperature
                humidity, temperature = line.split(',')

                # Prepare the data packet to send to Firebase
                data_packet = {
                    'humidity': float(humidity),
                    'temperature_celsius': float(temperature),
                    'timestamp': int(time.time()) # Current time in seconds
                }

                # Push the data to Firebase. .push() creates a new unique entry.
                ref.push().set(data_packet)
                print(f"Data sent to Firebase: {data_packet}")

            except ValueError:
                print(f"Could not parse line: {line}")
            except Exception as e:
                print(f"An error occurred: {e}")

except serial.SerialException as e:
    print(f"Error connecting to serial port {SERIAL_PORT}: {e}")
except FileNotFoundError:
    print("\nERROR: Could not find the Firebase credentials JSON file.")
    print("Please make sure the .json file is in the same folder as this script and the filename is correct.\n")
except Exception as e:
    print(f"An unexpected error occurred: {e}")