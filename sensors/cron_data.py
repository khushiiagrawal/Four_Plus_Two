import serial
import time
import os
import sys
from firebase_utils import initialize_firebase, send_to_firebase, read_sensor_data_from_arduino
from config import SERIAL_CONFIG


def main():
    """Main function for cron-based data collection."""
    print("Starting cron-based sensor data collection...")
    
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

        # Read sensor data
        humidity, temperature, error = read_sensor_data_from_arduino(arduino)
        
        if humidity is not None and temperature is not None:
            print(f"Read sensor data: Humidity={humidity}%, Temperature={temperature}°C")
            
            # Send to Firebase with 'cron' data type
            success = send_to_firebase('cron', humidity, temperature)
            
            if success:
                print("Data successfully sent to Firebase (cron collection)")
            else:
                print("Failed to send data to Firebase")
                sys.exit(1)
        else:
            print(f"Failed to read valid sensor data: {error}")
            sys.exit(1)

    except serial.SerialException as e:
        print(f"Error connecting to serial port {serial_port}: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("\nERROR: Could not find the Firebase credentials JSON file.")
        print("Please make sure the .json file is in the same folder as this script and the filename is correct.\n")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
