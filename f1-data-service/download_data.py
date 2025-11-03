"""
Full F1 2025 Data Downloader with Auto-Resume
Downloads all available FastF1 data up to current date (laps, telemetry, FIA messages)
and saves as CSVs locally, while preserving the full 2025 calendar.

Author: ChatGPT (for Heer)
Date: 2025-11-04
"""
import fastf1
import pandas as pd
import numpy as np
import os, time, logging, argparse, shutil
from tqdm import tqdm
from datetime import datetime, timezone

# ---------- CONFIG ----------
SEASON = 2025
OUT_DIR = "f1data/outputs_2025"  # Adjusted to match existing data location
RATE_LIMIT = 450        # adjusted for no delay
SAFETY_DELAY = 0       # no delay between API calls
CUTOFF_DATE = datetime(2025, 11, 4, tzinfo=timezone.utc)

os.makedirs(OUT_DIR, exist_ok=True)

# ---------- ARGPARSE ----------
parser = argparse.ArgumentParser(description="Download full F1 2025 season data.")
parser.add_argument("--resume", action="store_true",
                    help="Resume from where previous run left off (skip already saved sessions).")
parser.add_argument("--force", action="store_true",
                    help="Force re-download of all sessions even if files exist.")
args = parser.parse_args()

# ---------- LOGGING ----------
timestamp = datetime.now().strftime("%Y%m%d_%H%M")
log_dir = os.path.join(OUT_DIR, "logs")
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(filename=os.path.join(log_dir, f"run_{timestamp}.log"),
                    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
print(f"Logging to {log_dir}/run_{timestamp}.log")

# ---------- ENABLE CACHE ----------
cache_dir = os.path.join(OUT_DIR, "fastf1_cache")
os.makedirs(cache_dir, exist_ok=True)
fastf1.Cache.enable_cache(cache_dir)

# ---------- HELPERS ----------
def rate_limited_sleep():
    """Sleep safely between API calls."""
    time.sleep(SAFETY_DELAY)

def save_df(df, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)

def safe_load_session(event, sess_name):
    """Load a session with retry."""
    for attempt in range(5):
        try:
            rate_limited_sleep()
            sess = fastf1.get_session(SEASON, event['EventName'], sess_name)
            sess.load(laps=True, telemetry=False, weather=True, messages=True)
            return sess
        except Exception as e:
            wait = 30 * (attempt + 1)
            logging.warning(f"Retry {attempt+1} for {event['EventName']} {sess_name}: {e}")
            time.sleep(wait)
    logging.error(f"Failed to load session {event['EventName']} {sess_name}")
    return None

def event_date_utc(row):
    d = getattr(row, "Session1DateUtc", None)
    if pd.isna(d):
        return None
    try:
        return pd.to_datetime(d).tz_localize("UTC")
    except Exception:
        return None

# ---------- FETCH SCHEDULE ----------
print("Fetching 2025 event schedule...")
rate_limited_sleep()
schedule = fastf1.get_event_schedule(SEASON, include_testing=False)
schedule["EventDateUTC"] = schedule.apply(event_date_utc, axis=1)

# Save full calendar
events_path = os.path.join(OUT_DIR, "events.csv")
save_df(schedule, events_path)
print(f"✅ Full calendar saved: {events_path}")

# Filter completed events
schedule_filtered = schedule[schedule["EventDateUTC"].notnull()]
schedule_filtered = schedule_filtered[schedule_filtered["EventDateUTC"] <= CUTOFF_DATE]

print(f"📅 Found {len(schedule_filtered)} completed events up to {CUTOFF_DATE.date()}")

# ---------- DRIVERS / TEAMS ----------
print("Fetching drivers and teams...")
first_gp = schedule_filtered.iloc[0]
first_sess = fastf1.get_session(SEASON, first_gp['EventName'], "Race")
first_sess.load()
drivers_df = first_sess.results
teams_df = (drivers_df[['TeamName', 'TeamColor']]
             .drop_duplicates()
             .rename(columns={'TeamName': 'Team'}))
save_df(drivers_df, os.path.join(OUT_DIR, "drivers.csv"))
save_df(teams_df, os.path.join(OUT_DIR, "teams.csv"))
print("✅ Saved drivers.csv and teams.csv")

# ---------- SESSION LOOP ----------
session_types = ["FP1", "FP2", "FP3", "Qualifying", "Race"]

for _, event in schedule_filtered.iterrows():
    event_name = event['EventName']

    for sess_name in session_types:
        base_name = f"{event_name}_{sess_name}"
        laps_path = os.path.join(OUT_DIR, "laps", f"{base_name}_laps.csv")
        fia_path = os.path.join(OUT_DIR, "fia_messages", f"{base_name}.csv")

        # Auto-skip if laps and FIA files exist
        if args.resume and os.path.exists(laps_path) and os.path.exists(fia_path) and not args.force:
            print(f"⏩ Skipping {base_name} (already downloaded)")
            continue

        print(f"\n--- {event_name} {sess_name} ---")
        sess = safe_load_session(event, sess_name)
        if not sess:
            continue

        # Laps
        laps_df = sess.laps
        if not laps_df.empty:
            save_df(laps_df, laps_path)
            logging.info(f"Saved laps: {laps_path}")

        # FIA Messages
        if hasattr(sess, "race_control_messages") and not sess.race_control_messages.empty:
            save_df(sess.race_control_messages, fia_path)
            logging.info(f"Saved FIA messages: {fia_path}")

        # Standings (only for Race sessions)
        if sess_name == "Race":
            try:
                driver_standings = sess.get_driver_standings()
                if not driver_standings.empty:
                    standings_path = os.path.join(OUT_DIR, "standings", f"{event_name}_driver_standings.csv")
                    save_df(driver_standings, standings_path)
                    logging.info(f"Saved driver standings: {standings_path}")
            except Exception as e:
                logging.warning(f"Failed to get driver standings for {event_name}: {e}")

            try:
                constructor_standings = sess.get_constructor_standings()
                if not constructor_standings.empty:
                    standings_path = os.path.join(OUT_DIR, "standings", f"{event_name}_constructor_standings.csv")
                    save_df(constructor_standings, standings_path)
                    logging.info(f"Saved constructor standings: {standings_path}")
            except Exception as e:
                logging.warning(f"Failed to get constructor standings for {event_name}: {e}")

        # Delete cache for this session if laps and FIA data saved
        if os.path.exists(laps_path) and (not hasattr(sess, "race_control_messages") or os.path.exists(fia_path)):
            session_cache_dir = os.path.join(cache_dir, str(SEASON), event_name.replace(" ", "_"), sess_name)
            if os.path.exists(session_cache_dir):
                shutil.rmtree(session_cache_dir)
                logging.info(f"Deleted cache for {event_name} {sess_name}")

print("\nAll completed sessions processed. Auto-resume ready for future runs.")
