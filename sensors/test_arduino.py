#!/usr/bin/env python3
"""
Simple test script to debug Arduino connection and data reading.
"""

import serial
import time
import os

def test_arduino_connection():
    """Test Arduino connection and data reading."""
    print("Testing Arduino connection...")
    
    # Get serial configuration
    serial_port = os.getenv('SERIAL_PORT', '/dev/cu.usbmodem1101')
    baud_rate = int(os.getenv('BAUD_RATE', '9600'))
    
    try:
        # Connect to the serial port
        arduino = serial.Serial(serial_port, baud_rate, timeout=5)
        time.sleep(2)  # Wait for the connection to establish
        print(f"Connected to Arduino on {serial_port} at {baud_rate} baud")
        
        print("Reading data for 120 seconds (Arduino sends data every 30 seconds)...")
        start_time = time.time()
        
        while time.time() - start_time < 120:  # Run for 120 seconds
            try:
                # Read one line of data from the Arduino
                line = arduino.readline().decode('utf-8').strip()
                
                if line:
                    print(f"Raw data: '{line}'")
                    
                    # Check if the line contains data
                    if ',' in line:
                        try:
                            humidity, temperature = line.split(',')
                            print(f"Parsed: Humidity={humidity}%, Temperature={temperature}°C")
                        except ValueError:
                            print(f"Could not parse line: {line}")
                    else:
                        print(f"Line does not contain comma: {line}")
                else:
                    print("No data received")
                    
                time.sleep(1)  # Wait 1 second between reads
                
            except Exception as e:
                print(f"Error reading data: {e}")
                time.sleep(1)
        
        arduino.close()
        print("Test completed")
        
    except serial.SerialException as e:
        print(f"Error connecting to serial port {serial_port}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    test_arduino_connection()
