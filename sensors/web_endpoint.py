from flask import Flask, jsonify, Response
import serial
import time
import os
import threading
from firebase_utils import initialize_firebase, send_to_firebase, read_sensor_data_from_arduino
from config import SERIAL_CONFIG, FLASK_CONFIG
from prometheus_client import Gauge, Counter, CollectorRegistry, generate_latest, CONTENT_TYPE_LATEST

app = Flask(__name__)

# Global Arduino connection
arduino_connection = None
arduino_lock = threading.Lock()

# Prometheus metrics registry and metrics
registry = CollectorRegistry()
metric_temperature_celsius = Gauge(
    'sensor_temperature_celsius',
    'Current sensor temperature in Celsius',
    registry=registry,
)
metric_humidity_percent = Gauge(
    'sensor_humidity_percent',
    'Current sensor humidity in percent',
    registry=registry,
)
metric_last_read_success_unix = Gauge(
    'sensor_last_read_success_unix',
    'Unix timestamp of last successful sensor read',
    registry=registry,
)
metric_reads_total = Counter(
    'sensor_reads_total',
    'Total sensor read attempts',
    registry=registry,
)
metric_read_errors_total = Counter(
    'sensor_read_errors_total',
    'Total sensor read errors',
    registry=registry,
)
metric_firebase_writes_total = Counter(
    'firebase_writes_total',
    'Total Firebase write attempts by mode',
    ['mode', 'status'],
    registry=registry,
)

# Sampling interval for background metric updates (seconds)
METRICS_SAMPLE_INTERVAL = int(os.getenv('METRICS_SAMPLE_INTERVAL', '15'))
_sampler_thread_started = False

def init_arduino():
    """Initialize Arduino connection."""
    global arduino_connection
    
    if arduino_connection is None:
        try:
            serial_port = os.getenv('SERIAL_PORT', SERIAL_CONFIG['port'])
            baud_rate = int(os.getenv('BAUD_RATE', SERIAL_CONFIG['baud_rate']))
            
            arduino_connection = serial.Serial(
                serial_port, 
                baud_rate, 
                timeout=SERIAL_CONFIG['timeout']
            )
            time.sleep(2)  # Wait for connection to establish
            print(f"Arduino connected on {serial_port} at {baud_rate} baud")
            return True
        except Exception as e:
            print(f"Failed to connect to Arduino: {e}")
            return False
    return True

def read_sensor_data():
    """Read current sensor data from Arduino."""
    global arduino_connection
    
    with arduino_lock:
        if not init_arduino():
            return None, None, "Arduino connection failed"
        
        return read_sensor_data_from_arduino(arduino_connection)

def _update_metrics_from_read(humidity, temperature, error):
    """Update Prometheus metrics based on a sensor read result."""
    metric_reads_total.inc()
    if error or humidity is None or temperature is None:
        metric_read_errors_total.inc()
        return
    try:
        metric_humidity_percent.set(float(humidity))
        metric_temperature_celsius.set(float(temperature))
        metric_last_read_success_unix.set(time.time())
    except Exception:
        # Avoid raising inside metrics update path
        pass

def _metrics_sampler_loop():
    """Background loop that periodically reads from the sensor and updates metrics."""
    while True:
        try:
            humidity, temperature, error = read_sensor_data()
            _update_metrics_from_read(humidity, temperature, error)
        except Exception:
            metric_read_errors_total.inc()
        time.sleep(METRICS_SAMPLE_INTERVAL)

@app.route('/sensor/current', methods=['GET'])
def get_current_sensor_data():
    """Get current sensor readings."""
    try:
        humidity, temperature, error = read_sensor_data()
        _update_metrics_from_read(humidity, temperature, error)
        
        if error:
            return jsonify({
                'success': False,
                'error': error,
                'timestamp': time.time()
            }), 500
        
        return jsonify({
            'success': True,
            'data': {
                'humidity': humidity,
                'temperature_celsius': temperature,
                'timestamp': time.time()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': time.time()
        }), 500

@app.route('/sensor/send-to-firebase', methods=['POST'])
def send_current_data_to_firebase():
    """Get current sensor readings and send to Firebase."""
    try:
        humidity, temperature, error = read_sensor_data()
        _update_metrics_from_read(humidity, temperature, error)
        
        if error:
            return jsonify({
                'success': False,
                'error': error,
                'timestamp': time.time()
            }), 500
        
        # Send to Firebase
        success = send_to_firebase('on_demand', humidity, temperature)
        metric_firebase_writes_total.labels(mode='on_demand', status='success' if success else 'failure').inc()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Data sent to Firebase successfully',
                'data': {
                    'humidity': humidity,
                    'temperature_celsius': temperature,
                    'timestamp': time.time()
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to send data to Firebase',
                'data': {
                    'humidity': humidity,
                    'temperature_celsius': temperature,
                    'timestamp': time.time()
                }
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': time.time()
        }), 500

@app.route('/metrics', methods=['GET'])
def metrics():
    """Prometheus metrics endpoint."""
    return Response(generate_latest(registry), mimetype=CONTENT_TYPE_LATEST)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'sensor-web-endpoint',
        'timestamp': time.time()
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API documentation."""
    return jsonify({
        'service': 'IoT Sensor Web Endpoint',
        'endpoints': {
            'GET /sensor/current': 'Get current sensor readings',
            'POST /sensor/send-to-firebase': 'Get current readings and send to Firebase',
            'GET /health': 'Health check',
            'GET /': 'This documentation'
        },
        'usage': {
            'get_current_data': 'curl http://localhost:5001/sensor/current',
            'send_to_firebase': 'curl -X POST http://localhost:5001/sensor/send-to-firebase'
        }
    })

def main():
    """Main function to start the Flask server."""
    print("Starting IoT Sensor Web Endpoint...")
    
    # Initialize Firebase
    try:
        initialize_firebase()
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Firebase initialization failed: {e}")
        return
    
    # Initialize Arduino connection
    if not init_arduino():
        print("Failed to initialize Arduino connection")
        return
    
    global _sampler_thread_started
    if not _sampler_thread_started:
        sampler_thread = threading.Thread(target=_metrics_sampler_loop, daemon=True)
        sampler_thread.start()
        _sampler_thread_started = True
    
    print(f"Starting web server on {FLASK_CONFIG['host']}:{FLASK_CONFIG['port']}")
    print("Available endpoints:")
    print("  GET  /sensor/current - Get current sensor readings")
    print("  POST /sensor/send-to-firebase - Send current readings to Firebase")
    print("  GET  /metrics - Prometheus metrics endpoint")
    print("  GET  /health - Health check")
    print("  GET  / - API documentation")
    
    app.run(
        host=FLASK_CONFIG['host'],
        port=FLASK_CONFIG['port'],
        debug=FLASK_CONFIG['debug']
    )

if __name__ == "__main__":
    main()
