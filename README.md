# Problem no. SIH25001

## Sensors (Arduino, Firebase, Prometheus)

- Python under `sensors/` reads Arduino DHT11 and can push to Firebase Realtime DB.
- Flask web endpoint (`sensors/web_endpoint.py`) exposes:
  - `GET /sensor/current` current reading
  - `POST /sensor/send-to-firebase` push current reading to Firebase
  - `GET /metrics` Prometheus metrics (temperature, humidity, last read timestamps, counters)

Environment variables:

```
FIREBASE_DATABASE_URL=https://<your-db>.firebaseio.com
FIREBASE_CREDENTIALS_FILE=service_key.json
SERIAL_PORT=/dev/cu.usbmodem1101
```

Install deps and run exporter:

```bash
cd sensors
./venv/bin/pip install -r requirements.txt
./venv/bin/python web_endpoint.py
```

## Observability Stack (Prometheus + Grafana)

Local stack via Docker Compose with provisioning.

```bash
docker compose up -d
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3001 (anonymous viewer enabled)
```

Prometheus scrapes `http://host.docker.internal:5001/metrics` by default.
Grafana is preloaded with dashboard `Sensor Overview`.

## Frontend (Next.js)

- Dashboard embeds Grafana (`/dashboard`), configurable via env var:

```
NEXT_PUBLIC_GRAFANA_EMBED_URL=http://localhost:3001/dashboards
```

If not set, it defaults to `http://localhost:3001/`.

## Realtime Alerts (Firebase Functions + ML)

Flow:

1. Arduino → Python (`sensors/continuous_data.py`) reads humidity/temperature.
2. Python writes to Firebase Realtime Database using keys from `sensors/config.py` (e.g., `sensor_data_continuous`).
3. Cloud Function (`functions/src/index.ts`) triggers on new RTDB records:
   - Calls ML alert API (`ml/app.py` → `POST /alert`) or falls back to thresholds.
   - Sends FCM topic notification.
   - Logs alert to Firestore collection for history.
4. Frontend dashboard remains unchanged; alerts can be listed via an API if desired.

### Configure

Functions env:

- `RTDB_PATH` default `/sensor_data_continuous/{readingId}`
- `ML_ALERT_URL` e.g., `http://localhost:8000/alert` (optional)
- `FCM_TOPIC` default `alerts`
- `FS_ALERTS_COLLECTION` default `alerts`
- `TEMP_HIGH_C` default `38`
- `HUMIDITY_HIGH_PCT` default `80`

Provide Firebase Admin credentials via Functions runtime (service account) and ensure RTDB path matches what Python writes.

ML service env (optional):

- `TEMP_HIGH_C`, `HUMIDITY_HIGH_PCT` to tune `/alert` rule.

### Run locally

ML service:

```bash
cd ml
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Functions emulator:

```bash
cd functions
npm i
npm run build
firebase emulators:start --only functions
```

### Deploy

```bash
cd functions
npm run deploy
```

Make sure you selected the Firebase project (`firebase use <project>`), and RTDB rules allow the sensor writes. 