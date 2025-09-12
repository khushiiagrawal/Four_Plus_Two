# Firebase database keys for different data collection modes
FIREBASE_KEYS = {
    'continuous': 'sensor_data_continuous',  # Every 30 seconds
    'cron': 'sensor_data_cron',              # Every 1 minute or at 8:00 AM
    'on_demand': 'sensor_data_on_demand'     # When endpoint is hit
}

# Serial port configuration
SERIAL_CONFIG = {
       'port': '/dev/cu.your_arduino_port',  # Update with your Arduino port
       'baud_rate': 9600,
       'timeout': 1
}

# Flask web server configuration
FLASK_CONFIG = {
    'host': '0.0.0.0',
    'port': 5001,
    'debug': False
}
