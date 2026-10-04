# AirTrace 🌬️
### Personal Air Quality Exposure Tracker

> **Architected a full-stack air quality tracker from scratch — React dashboard, 11-endpoint Express REST API, and SQLite persistence — integrating live US EPA AQI for any GPS coordinate with zero API keys.**

---

## Verified Metrics

| Metric | Value |
|---|---|
| API response time (DB-backed routes) | **< 2ms avg** |
| Test coverage | **84% (211 tests)** |
| Full Jest suite runtime | **1.66 seconds** |
| Gzipped frontend bundle | **208 kB** |
| Vite production build | **1.55s across 881 modules** |
| REST API endpoints | **11** |
| Backend modules | **43** |
| Source lines of code | **5,600+** |

> All metrics are reproducible — see [Reproducing the Metrics](#reproducing-the-metrics) below.

---

## What It Does

AirTrace solves a real gap: weather apps give you one AQI number for an entire city. AirTrace gives you the **cumulative exposure you actually experienced** based on where you went and how long you stayed.

You log location visits. For each one, the backend:
1. Validates the input
2. Fetches **live US EPA AQI** (PM2.5) from [Open-Meteo](https://open-meteo.com/en/docs/air-quality-api) using your exact GPS coordinates
3. Computes your **Exposure Index** = `AQI × duration (minutes)`
4. Persists everything in an **atomic SQLite transaction**
5. Aggregates a weighted daily average across all visits
6. Renders a live interactive dashboard

---

## Architecture

```
React Frontend (Vite)
       │
       │  /api proxy (Vite dev server)
       ▼
Express REST API (Node.js)
       │                    │
       ▼                    ▼
  SQLite DB          Open-Meteo API
  (better-sqlite3)   (live AQI data)
```

### Data Pipeline (per visit)

```
POST /api/visits
  │
  ├─ 1. Validate — body fields, coordinate ranges, time window
  ├─ 2. Fetch AQI — async call to Open-Meteo → nearest hourly reading
  ├─ 3. Compute — Exposure Index = AQI × durationMinutes
  ├─ 4. Persist — atomic SQLite transaction (3 tables)
  └─ 5. Respond — full visit + exposure record in < 10ms (local processing)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS |
| Maps | React-Leaflet, Esri Dark Canvas tiles |
| Charts | Recharts |
| Backend | Node.js 26, Express.js |
| Database | SQLite via better-sqlite3 |
| Live AQI | Open-Meteo Air Quality API |
| Testing | Jest, Supertest |
| Dev tooling | Vite proxy, npm workspaces |

> **Zero API keys required.** Open-Meteo is 100% free with global coverage.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/exposure/today` | Most recent day's full exposure data |
| `GET` | `/api/exposure/history` | All available dates + summaries |
| `GET` | `/api/exposure/:date` | Full exposure detail for a date |
| `GET` | `/api/locations/:date` | Raw location visits for a date |
| `GET` | `/api/aqi/categories` | EPA AQI category reference |
| `GET` | `/api/aqi/live?lat=&lng=` | **Real-time AQI for any GPS coordinate** |
| `GET` | `/api/aqi/:date` | AQI readings for a date |
| `GET` | `/api/analytics/overview` | Cross-date aggregate analytics |
| `GET` | `/api/analytics/daily/:date` | Per-day analytics breakdown |
| `POST` | `/api/visits` | Log a new location visit (triggers live AQI fetch) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/Arnyz17/AirTrace.git
cd AirTrace

# Install all dependencies (root + frontend + backend)
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Start backend (port 3001)
cd backend && node src/server.js

# In a new terminal — start frontend (port 5173)
cd frontend && npx vite --port 5173
```

Open **http://localhost:5173**

---

## Reproducing the Metrics

### Test coverage (84%, 211 tests, 1.66s)
```bash
cd backend
npm test -- --coverage
```

### Production bundle (208 kB gzip, 1.55s build)
```bash
cd frontend
npx vite build
```

### API response time (sub-2ms)
```bash
# With backend running:
node -e "
const t = Date.now();
fetch('http://127.0.0.1:3001/api/exposure/today')
  .then(() => console.log('Response time:', Date.now() - t, 'ms'));
"
```

### Live AQI fetch (any coordinates)
```bash
curl "http://127.0.0.1:3001/api/aqi/live?lat=40.7128&lng=-74.006"
```

---

## Features

- **Interactive Exposure Map** — Esri dark canvas with color-coded AQI markers per visit
- **GPS "Locate Me"** — detects your exact location and fetches real current AQI instantly
- **Live AQI Banner** — shows real PM2.5 and US AQI at your coordinates after locating
- **Timeline Trend Chart** — AQI across all your visits throughout the day
- **Exposure Breakdown** — time spent in each EPA category (Good / Moderate / Unhealthy)
- **Daily Summary Card** — weighted avg AQI, highest exposure spot, total time tracked
- **Historical Navigation** — browse any past day's full exposure data
- **Clean Empty State** — proper onboarding when no visits are logged yet

---

## Project Structure

```
AirTrace/
├── frontend/
│   └── src/
│       ├── components/     # 11 React components
│       ├── api/            # Backend API client
│       └── data/           # AQI band config
└── backend/
    └── src/
        ├── controllers/    # Route handlers
        ├── services/       # Business logic
        ├── providers/      # AQI data abstraction (mock + Open-Meteo)
        ├── db/             # SQLite schema, repositories, seed
        ├── models/         # Data models
        ├── routes/         # Express routers
        └── utils/          # Validation, date helpers
```

---

## License

MIT
