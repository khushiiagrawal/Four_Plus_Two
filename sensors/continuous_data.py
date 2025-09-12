import serial
import time
import os
from firebase_utils import initialize_firebase, send_to_firebase, read_sensor_data_from_arduino
from config import SERIAL_CONFIG

def main():
    """Main function for continuous data collection."""
    print("Starting continuous sensor data collection...")
    
    # Initialize Firebase
    try:
        initialize_firebase()
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Firebase initialization failed: {e}")
        return
    
    # Get serial configuration
    serial_port = os.getenv('SERIAL_PORT', SERIAL_CONFIG['port'])
    baud_rate = int(os.getenv('BAUD_RATE', SERIAL_CONFIG['baud_rate']))
    
    try:
        # Connect to the serial port
        arduino = serial.Serial(serial_port, baud_rate, timeout=SERIAL_CONFIG['timeout'])
        time.sleep(2)  # Wait for the connection to establish
        print(f"Connected to Arduino on {serial_port} at {baud_rate} baud")

        while True:
            print("Waiting for Arduino data...")
            # Read sensor data from Arduino
            humidity, temperature, error = read_sensor_data_from_arduino(arduino)

            # Check if we got valid data
            if humidity is not None and temperature is not None:
                print(f"✅ Received from Arduino: Humidity={humidity}%, Temperature={temperature}°C")
                
                # Send to Firebase with 'continuous' data type
                success = send_to_firebase('continuous', humidity, temperature)
                
                if success:
                    print("✅ Data sent to Firebase successfully")
                else:
                    print("❌ Failed to send data to Firebase")
                
                # Wait 30 seconds before next reading (matches Arduino timing)
                print("⏳ Waiting 30 seconds for next reading...")
                time.sleep(30)
            else:
                print(f"❌ Failed to read sensor data: {error}")
                print("⏳ Waiting 10 seconds before retrying...")
                time.sleep(10)

    except serial.SerialException as e:
        print(f"Error connecting to serial port {serial_port}: {e}")
    except FileNotFoundError:
        print("\nERROR: Could not find the Firebase credentials JSON file.")
        print("Please make sure the .json file is in the same folder as this script and the filename is correct.\n")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
