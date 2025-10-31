# F1 Data Service

Python Flask microservice that provides F1 data using the FastF1 library.

## Setup

1. **Create a virtual environment** (recommended):
```bash
cd f1-data-service
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Run the service**:
```bash
python python_server.py
```

The service will start on `http://localhost:5003`

## Available Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/standings?year=2024` - Driver standings
- `GET /api/v1/constructor-standings?year=2024` - Constructor standings
- `GET /api/v1/drivers?year=2024` - List of drivers
- `GET /api/v1/telemetry/<driver_abbr>?year=2024&event=1&session=R` - Driver telemetry
- `GET /api/v1/schedule?year=2024` - Race schedule
- `GET /api/v1/race-results/<year>/<event>` - Race results

## Notes

- First run will take longer as FastF1 downloads and caches data
- Data is cached in the `cache/` directory
- The service automatically finds the latest completed race
