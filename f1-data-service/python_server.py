"""
F1 Data Service - Flask Microservice
Provides F1 data via REST API endpoints using pre-downloaded CSV data.

Author: ChatGPT (for Heer)
Date: 2025-11-04
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ---------- CONFIG ----------
DATA_DIR = "f1data/outputs_2025"
SEASON = 2025

# ---------- HELPERS ----------
def load_csv_safe(path):
    """Load CSV with error handling."""
    try:
        if os.path.exists(path):
            return pd.read_csv(path)
        else:
            return pd.DataFrame()
    except Exception as e:
        print(f"Error loading {path}: {e}")
        return pd.DataFrame()

def get_latest_race():
    """Get the latest completed race event name."""
    events_df = load_csv_safe(os.path.join(DATA_DIR, "events.csv"))
    if events_df.empty:
        return None
    # Filter completed events
    completed = events_df[events_df["EventDateUTC"].notnull()]
    completed["EventDateUTC"] = pd.to_datetime(completed["EventDateUTC"], errors='coerce')
    completed = completed[completed["EventDateUTC"] <= datetime.now(completed["EventDateUTC"].dt.tz)]
    if completed.empty:
        return None
    return completed.iloc[-1]["EventName"]

# ---------- ENDPOINTS ----------

@app.route('/api/v1/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "F1 Data Service", "version": "1.0"})

@app.route('/api/v1/standings', methods=['GET'])
def driver_standings():
    """Get driver standings for a given year."""
    year = request.args.get('year', default=SEASON, type=int)
    if year != SEASON:
        return jsonify({"error": "Only 2025 data available"}), 404

    latest_race = get_latest_race()
    if not latest_race:
        return jsonify({"error": "No completed races found"}), 404

    standings_path = os.path.join(DATA_DIR, "standings", f"{latest_race}_driver_standings.csv")
    df = load_csv_safe(standings_path)
    if df.empty:
        return jsonify({"error": "Standings data not available"}), 404

    # Convert to expected format for load script
    standings = []
    for _, row in df.iterrows():
        standings.append({
            "position": int(row.get("Position", 0)),
            "points": float(row.get("Points", 0)),
            "wins": 0,  # No wins data in CSV
            "driver": row.get("Abbreviation", ""),
            "driverNumber": str(int(row.get("DriverNumber", 0))),
            "firstName": row.get("FirstName", ""),
            "lastName": row.get("LastName", ""),
            "fullName": row.get("FullName", ""),
            "team": row.get("TeamName", ""),
            "teamColor": row.get("TeamColor", "cccccc")
        })

    response = {
        "standings": standings,
        "lastRace": latest_race,
        "round": len(df),  # Approximate round number
        "year": year
    }
    return jsonify(response)

@app.route('/api/v1/constructor-standings', methods=['GET'])
def constructor_standings():
    """Get constructor standings for a given year."""
    year = request.args.get('year', default=SEASON, type=int)
    if year != SEASON:
        return jsonify({"error": "Only 2025 data available"}), 404

    latest_race = get_latest_race()
    if not latest_race:
        return jsonify({"error": "No completed races found"}), 404

    standings_path = os.path.join(DATA_DIR, "standings", f"{latest_race}_constructor_standings.csv")
    df = load_csv_safe(standings_path)
    if df.empty:
        return jsonify({"error": "Constructor standings data not available"}), 404

    standings = df.to_dict('records')
    return jsonify(standings)

@app.route('/api/v1/drivers', methods=['GET'])
def drivers():
    """Get list of drivers for a given year."""
    year = request.args.get('year', default=SEASON, type=int)
    if year != SEASON:
        return jsonify({"error": "Only 2025 data available"}), 404

    drivers_path = os.path.join(DATA_DIR, "drivers.csv")
    df = load_csv_safe(drivers_path)
    if df.empty:
        return jsonify({"error": "Drivers data not available"}), 404

    drivers_list = df.to_dict('records')
    return jsonify(drivers_list)

@app.route('/api/v1/telemetry/<driver_abbr>', methods=['GET'])
def telemetry(driver_abbr):
    """Get telemetry data for a driver in a specific event and session."""
    year = request.args.get('year', default=SEASON, type=int)
    event = request.args.get('event', type=str)
    session = request.args.get('session', default='R', type=str)

    if year != SEASON:
        return jsonify({"error": "Only 2025 data available"}), 404
    if not event:
        return jsonify({"error": "Event parameter required"}), 400

    # Map session abbreviations
    session_map = {'R': 'Race', 'Q': 'Qualifying', 'FP1': 'FP1', 'FP2': 'FP2', 'FP3': 'FP3'}
    sess_name = session_map.get(session.upper(), session)

    laps_path = os.path.join(DATA_DIR, "laps", f"{event}_{sess_name}_laps.csv")
    df = load_csv_safe(laps_path)
    if df.empty:
        return jsonify({"error": "Telemetry data not available"}), 404

    # Filter by driver
    driver_data = df[df['Driver'] == driver_abbr.upper()]
    if driver_data.empty:
        return jsonify({"error": f"No data for driver {driver_abbr}"}), 404

    telemetry_data = driver_data.to_dict('records')
    return jsonify(telemetry_data)

@app.route('/api/v1/schedule', methods=['GET'])
def schedule():
    """Get race schedule for a given year."""
    year = request.args.get('year', default=SEASON, type=int)
    if year != SEASON:
        return jsonify({"error": "Only 2025 data available"}), 404

    events_path = os.path.join(DATA_DIR, "events.csv")
    df = load_csv_safe(events_path)
    if df.empty:
        return jsonify({"error": "Schedule data not available"}), 404

    schedule_data = df.to_dict('records')
    return jsonify(schedule_data)

@app.route('/api/v1/race-results/<int:year>/<event>', methods=['GET'])
def race_results(year, event):
    """Get race results for a specific year and event."""
    if year != SEASON:
        return jsonify({"error": "Only 2025 data available"}), 404

    # Assume event is the event name, find the race results
    laps_path = os.path.join(DATA_DIR, "laps", f"{event}_Race_laps.csv")
    df = load_csv_safe(laps_path)
    if df.empty:
        return jsonify({"error": "Race results not available"}), 404

    # Aggregate to get race results (simplified: fastest lap per driver)
    results = df.loc[df.groupby('Driver')['LapTime'].idxmin()].sort_values('Position')
    results_data = results.to_dict('records')
    return jsonify(results_data)

# ---------- MAIN ----------
if __name__ == '__main__':
    print("Starting F1 Data Service on http://localhost:5003")
    app.run(host='0.0.0.0', port=5003, debug=True)
