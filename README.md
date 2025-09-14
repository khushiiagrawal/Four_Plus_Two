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