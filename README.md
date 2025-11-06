<!--
  Updated README: cleaned, restructured, and expanded quickstart.
  Keeps content accurate to repo scripts (backend: `npm start`/`npm run dev`; frontend: `npm run dev`).
-->

# TheGridLive

A beautiful, data-rich Formula 1 web app: live race telemetry, driver & constructor standings, historical data, a news feed, and a real-time chat — powered by a Python data service, a Node.js API, and a React/Vite frontend.

Why this repo exists: to explore F1 data, build interactive visualizations, and provide a delightful fan experience for race weekends.

## Highlights

- Live and historical F1 data via FastF1
- Driver profiles, race results and schedules
- Real-time chat rooms and user favorites (MongoDB)
- Interactive predictors, stats and visualizations (Recharts)
- Fast developer experience with Vite + nodemon

## Quick links

- Frontend: `frontend/` (Vite + React)
- Backend: `backend/` (Express + Mongoose)
- Data service: `f1data/` (Python scripts / FastF1 outputs)

## Quick Start (Windows - cmd.exe)

This project has three main pieces. Below are minimal steps to get them running locally.

Prerequisites

- Node.js (v18+ recommended)
- npm
- Python 3.8+ (for the FastF1 data scripts, optional depending on your needs)
- MongoDB (local or hosted)

1) Start the backend

Open a terminal (cmd.exe):

```cmd
cd c:\Users\heerm\OneDrive\Desktop\TheGridLive\backend
npm install

:: create a .env (example below) or set the vars directly
:: set MONGO_URI=mongodb://localhost:27017/thegridlive
:: set PYTHON_API_URL=http://localhost:5003

:: Development
npm run dev

:: Production-like
npm start
```

The backend scripts are defined in `backend/package.json`: `start` -> `node server.js`, `dev` -> `nodemon server.js`.

2) Start the frontend

```cmd
cd ..\frontend
npm install
npm run dev
```

Default Vite dev server: http://localhost:5173

3) (Optional) Python / FastF1 data

If you use the FastF1-based data pipeline, follow instructions in `f1data/` or `f1data/downloaddata.py`. The project contains cached CSV outputs under `f1data/outputs_2025/` used by the backend.

4) One-line helper

There is a `start-all.sh` script in the repo for UNIX-like systems. On Windows, run each service in separate terminals, or use WSL.

## Environment variables

Create a `backend/.env` file with at least:

```
PORT=5002
MONGO_URI=mongodb://localhost:27017/thegridlive
PYTHON_API_URL=http://localhost:5003
```

For the frontend, Vite uses `VITE_` prefixed variables. Example `frontend/.env`:

```
VITE_API_URL=http://localhost:5002
```

Tip for Windows cmd.exe (one-off):

```cmd
set MONGO_URI=mongodb://localhost:27017/thegridlive
set VITE_API_URL=http://localhost:5002
```

## Project structure (top-level)

```
TheGridLive/
├─ backend/        # Express API (server.js, models/*)
├─ frontend/       # Vite + React UI
├─ f1data/         # Python scripts, CSV outputs & FastF1 cache
├─ README.md
├─ SETUP_GUIDE.md
└─ start-all.sh
```

## Architecture (short)

1. Python/FastF1 (data ingestion, optional) — processes raw race data, produces CSV/JSON outputs.
2. Node.js backend (Express) — serves API, proxies F1 data, stores users & chat in MongoDB.
3. React frontend (Vite) — interactive UI, calls backend APIs.

## Notable npm scripts (from package.json)

- backend: `npm run dev` (nodemon server.js) and `npm start` (node server.js)
- frontend: `npm run dev` (vite), `npm run build`, `npm run preview`

## Troubleshooting

- Backend can't reach MongoDB: ensure `MONGO_URI` is correct and MongoDB is running.
- Broken API calls from the frontend: confirm `VITE_API_URL` and restart frontend after changes.
- Python/FastF1 errors: FastF1 needs network access for session data; check the `f1data/` cache and Python dependencies.

Useful Windows troubleshooting commands (cmd.exe):

```cmd
:: Find process using port
netstat -ano | findstr :5002

:: Kill process by PID
taskkill /PID <PID> /F
```

## Contributing

We welcome contributions!

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes and add tests where appropriate
4. Open a pull request with a short description and screenshots if UI changes

Guidelines

- Keep commits small and focused
- Follow existing code style
- Add or update `Attributions.md` for any third-party assets you introduce

## License

This project is MIT-licensed — see the `LICENSE` file.

## Credits & Data sources

- FastF1 (data)
- Formula 1 (public-facing stats and schedules)
- Icons, images and UI kits are credited in `frontend/src/Attributions.md`

---

If you'd like, I can also:

- Add badges (build, license, npm version) at the top
- Create a small `README` table of contents with anchors
- Add a `try-it` section that runs a quick smoke test script

Happy hacking — and happy racing! 🏁
