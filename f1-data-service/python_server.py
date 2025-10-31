"""
F1 Data Service - Flask API for FastF1 Data
Provides REST endpoints for F1 data to be consumed by the Node.js backend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import pandas as pd
import logging
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Enable FastF1 cache to speed up data loading
cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
os.makedirs(cache_dir, exist_ok=True)
fastf1.Cache.enable_cache(cache_dir)

# Helper function to safely convert pandas/numpy types to Python native types
def sanitize_data(obj):
    """Convert pandas/numpy types to JSON-serializable Python types"""
    if pd.isna(obj):
        return None
    if isinstance(obj, (pd.Timestamp, datetime)):
        return obj.isoformat()
    if isinstance(obj, (pd.Timedelta)):
        return str(obj)
    if hasattr(obj, 'item'):  # numpy types
        return obj.item()
    return obj


@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'F1 Data Service',
        'version': '1.0.0'
    })


@app.route('/api/v1/standings', methods=['GET'])
def get_driver_standings():
    """
    Get current season driver standings
    Query params:
    - year: Season year (default: current year)
    """
    try:
        year = request.args.get('year', datetime.now().year)
        logger.info(f"Fetching driver standings for {year}")
        
        # Get the latest completed race
        schedule = fastf1.get_event_schedule(int(year))
        now = pd.Timestamp.now()
        
        # Find the most recent completed race
        completed_races = schedule[schedule['EventDate'] < now]
        
        if completed_races.empty:
            return jsonify({
                'error': 'No completed races found for this season',
                'standings': []
            }), 404
        
        latest_race = completed_races.iloc[-1]
        event_name = latest_race['EventName']
        round_number = latest_race['RoundNumber']
        
        logger.info(f"Latest race: {event_name} (Round {round_number})")
        
        # Load the session
        session = fastf1.get_session(int(year), round_number, 'R')
        session.load()
        
        # Get results
        results = session.results
        
        standings = []
        for idx, driver in results.iterrows():
            standings.append({
                'position': sanitize_data(driver.get('Position', idx + 1)),
                'driver': sanitize_data(driver.get('Abbreviation', driver.get('DriverNumber', 'UNK'))),
                'driverNumber': sanitize_data(driver.get('DriverNumber')),
                'firstName': sanitize_data(driver.get('FirstName', '')),
                'lastName': sanitize_data(driver.get('LastName', '')),
                'fullName': sanitize_data(driver.get('FullName', '')),
                'team': sanitize_data(driver.get('TeamName', '')),
                'teamColor': sanitize_data(driver.get('TeamColor', 'FFFFFF')),
                'points': sanitize_data(driver.get('Points', 0)),
                'status': sanitize_data(driver.get('Status', 'Finished')),
                'time': sanitize_data(driver.get('Time', None))
            })
        
        return jsonify({
            'season': int(year),
            'lastRace': event_name,
            'round': int(round_number),
            'standings': standings
        })
        
    except Exception as e:
        logger.error(f"Error fetching standings: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch driver standings'
        }), 500


@app.route('/api/v1/constructor-standings', methods=['GET'])
def get_constructor_standings():
    """
    Get current season constructor standings
    Query params:
    - year: Season year (default: current year)
    """
    try:
        year = request.args.get('year', datetime.now().year)
        logger.info(f"Fetching constructor standings for {year}")
        
        # Get the latest completed race
        schedule = fastf1.get_event_schedule(int(year))
        now = pd.Timestamp.now()
        
        completed_races = schedule[schedule['EventDate'] < now]
        
        if completed_races.empty:
            return jsonify({
                'error': 'No completed races found for this season',
                'standings': []
            }), 404
        
        latest_race = completed_races.iloc[-1]
        round_number = latest_race['RoundNumber']
        
        # Load the session
        session = fastf1.get_session(int(year), round_number, 'R')
        session.load()
        
        # Get results and aggregate by team
        results = session.results
        
        team_points = {}
        for idx, driver in results.iterrows():
            team = sanitize_data(driver.get('TeamName', 'Unknown'))
            points = sanitize_data(driver.get('Points', 0))
            color = sanitize_data(driver.get('TeamColor', 'FFFFFF'))
            
            if team not in team_points:
                team_points[team] = {
                    'team': team,
                    'teamColor': color,
                    'points': 0,
                    'drivers': []
                }
            
            team_points[team]['points'] += points
            team_points[team]['drivers'].append({
                'name': sanitize_data(driver.get('Abbreviation', '')),
                'fullName': sanitize_data(driver.get('FullName', ''))
            })
        
        # Sort by points
        standings = sorted(team_points.values(), key=lambda x: x['points'], reverse=True)
        
        # Add positions
        for idx, team in enumerate(standings):
            team['position'] = idx + 1
        
        return jsonify({
            'season': int(year),
            'standings': standings
        })
        
    except Exception as e:
        logger.error(f"Error fetching constructor standings: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch constructor standings'
        }), 500


@app.route('/api/v1/telemetry/<driver_abbr>', methods=['GET'])
def get_driver_telemetry(driver_abbr):
    """
    Get telemetry data for a specific driver
    Path params:
    - driver_abbr: Driver abbreviation (e.g., VER, HAM, LEC)
    Query params:
    - year: Season year (default: current year)
    - event: Event name or round number (default: latest)
    - session: Session type (FP1, FP2, FP3, Q, R) (default: R)
    """
    try:
        year = request.args.get('year', datetime.now().year)
        event = request.args.get('event', None)
        session_type = request.args.get('session', 'R')
        
        logger.info(f"Fetching telemetry for {driver_abbr} - {year}/{event}/{session_type}")
        
        # If no event specified, get the latest
        if not event:
            schedule = fastf1.get_event_schedule(int(year))
            now = pd.Timestamp.now()
            completed_races = schedule[schedule['EventDate'] < now]
            
            if completed_races.empty:
                return jsonify({'error': 'No completed races found'}), 404
            
            event = completed_races.iloc[-1]['RoundNumber']
        
        # Load session
        session = fastf1.get_session(int(year), event, session_type)
        session.load()
        
        # Get driver laps
        driver_laps = session.laps.pick_driver(driver_abbr.upper())
        
        if driver_laps.empty:
            return jsonify({'error': f'No data found for driver {driver_abbr}'}), 404
        
        # Get fastest lap telemetry
        fastest_lap = driver_laps.pick_fastest()
        telemetry = fastest_lap.get_telemetry()
        
        # Convert telemetry to JSON-serializable format
        telemetry_data = []
        for idx, point in telemetry.iterrows():
            telemetry_data.append({
                'distance': sanitize_data(point.get('Distance', 0)),
                'speed': sanitize_data(point.get('Speed', 0)),
                'rpm': sanitize_data(point.get('RPM', 0)),
                'throttle': sanitize_data(point.get('Throttle', 0)),
                'brake': sanitize_data(point.get('Brake', False)),
                'gear': sanitize_data(point.get('nGear', 0)),
                'drs': sanitize_data(point.get('DRS', 0))
            })
        
        # Sample data to reduce payload size (every 10th point)
        sampled_data = telemetry_data[::10]
        
        return jsonify({
            'driver': driver_abbr.upper(),
            'lapTime': sanitize_data(fastest_lap.get('LapTime')),
            'team': sanitize_data(fastest_lap.get('Team', '')),
            'compound': sanitize_data(fastest_lap.get('Compound', '')),
            'telemetry': sampled_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching telemetry: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch telemetry data'
        }), 500


@app.route('/api/v1/drivers', methods=['GET'])
def get_drivers():
    """
    Get list of all drivers for a season
    Query params:
    - year: Season year (default: current year)
    """
    try:
        year = request.args.get('year', datetime.now().year)
        logger.info(f"Fetching drivers list for {year}")
        
        # Get the latest completed race
        schedule = fastf1.get_event_schedule(int(year))
        now = pd.Timestamp.now()
        
        completed_races = schedule[schedule['EventDate'] < now]
        
        if completed_races.empty:
            return jsonify({
                'error': 'No completed races found for this season',
                'drivers': []
            }), 404
        
        latest_race = completed_races.iloc[-1]
        round_number = latest_race['RoundNumber']
        
        # Load the session
        session = fastf1.get_session(int(year), round_number, 'R')
        session.load()
        
        # Get results
        results = session.results
        
        drivers = []
        for idx, driver in results.iterrows():
            drivers.append({
                'driverNumber': sanitize_data(driver.get('DriverNumber')),
                'abbreviation': sanitize_data(driver.get('Abbreviation', '')),
                'firstName': sanitize_data(driver.get('FirstName', '')),
                'lastName': sanitize_data(driver.get('LastName', '')),
                'fullName': sanitize_data(driver.get('FullName', '')),
                'team': sanitize_data(driver.get('TeamName', '')),
                'teamColor': sanitize_data(driver.get('TeamColor', 'FFFFFF')),
                'headshotUrl': sanitize_data(driver.get('HeadshotUrl', '')),
                'countryCode': sanitize_data(driver.get('CountryCode', ''))
            })
        
        return jsonify({
            'season': int(year),
            'drivers': drivers
        })
        
    except Exception as e:
        logger.error(f"Error fetching drivers: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch drivers list'
        }), 500


@app.route('/api/v1/schedule', methods=['GET'])
def get_schedule():
    """
    Get race schedule for a season
    Query params:
    - year: Season year (default: current year)
    """
    try:
        year = request.args.get('year', datetime.now().year)
        logger.info(f"Fetching schedule for {year}")
        
        schedule = fastf1.get_event_schedule(int(year))
        
        events = []
        for idx, event in schedule.iterrows():
            events.append({
                'round': sanitize_data(event.get('RoundNumber')),
                'eventName': sanitize_data(event.get('EventName', '')),
                'location': sanitize_data(event.get('Location', '')),
                'country': sanitize_data(event.get('Country', '')),
                'eventDate': sanitize_data(event.get('EventDate')),
                'eventFormat': sanitize_data(event.get('EventFormat', 'conventional')),
                'session1': sanitize_data(event.get('Session1Date')),
                'session2': sanitize_data(event.get('Session2Date')),
                'session3': sanitize_data(event.get('Session3Date')),
                'session4': sanitize_data(event.get('Session4Date')),
                'session5': sanitize_data(event.get('Session5Date'))
            })
        
        return jsonify({
            'season': int(year),
            'events': events
        })
        
    except Exception as e:
        logger.error(f"Error fetching schedule: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch schedule'
        }), 500


@app.route('/api/v1/race-results/<int:year>/<event>', methods=['GET'])
def get_race_results(year, event):
    """
    Get race results for a specific event
    Path params:
    - year: Season year
    - event: Event name or round number
    """
    try:
        logger.info(f"Fetching race results for {year}/{event}")
        
        session = fastf1.get_session(year, event, 'R')
        session.load()
        
        results = session.results
        
        race_results = []
        for idx, driver in results.iterrows():
            race_results.append({
                'position': sanitize_data(driver.get('Position', idx + 1)),
                'driver': sanitize_data(driver.get('Abbreviation', '')),
                'driverNumber': sanitize_data(driver.get('DriverNumber')),
                'fullName': sanitize_data(driver.get('FullName', '')),
                'team': sanitize_data(driver.get('TeamName', '')),
                'teamColor': sanitize_data(driver.get('TeamColor', 'FFFFFF')),
                'gridPosition': sanitize_data(driver.get('GridPosition', 0)),
                'status': sanitize_data(driver.get('Status', '')),
                'points': sanitize_data(driver.get('Points', 0)),
                'time': sanitize_data(driver.get('Time', None)),
                'fastestLap': sanitize_data(driver.get('FastestLap', None)),
                'fastestLapTime': sanitize_data(driver.get('FastestLapTime', None))
            })
        
        return jsonify({
            'season': year,
            'event': event,
            'results': race_results
        })
        
    except Exception as e:
        logger.error(f"Error fetching race results: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch race results'
        }), 500


if __name__ == '__main__':
    logger.info("Starting F1 Data Service on port 5003")
    app.run(host='0.0.0.0', port=5003, debug=True)
