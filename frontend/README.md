# Air Quality Exposure Tracker — Frontend

## Run it with mock data (no backend needed)

```bash
npm install
npm run dev
```

## Connect to Arnyz's real backend (AirTrace)

His backend is Node/Express + SQLite, runs on port 3001.

1. In his `backend/` folder:
   ```bash
   npm install
   npm run seed     # populates the SQLite db with sample data
   npm start        # runs at http://localhost:3001
   ```
2. In this frontend folder, create a `.env` file (see `.env.example`):
   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   ```
3. Restart `npm run dev`. That's it — no other changes needed, no CORS issues
   (his backend already allows `localhost:5173` by default).

### What his API actually returns (already wired up in `src/api/aqiApi.js`)
One endpoint, `GET /api/exposure/:date`, returns everything the dashboard
needs in one call: `{ success, data: { summary, locations } }`. Field names
differ from generic assumptions (`locationName`/`latitude`/`longitude`/
`startTime` instead of `name`/`lat`/`lng`/`timestamp`), and there's no
separate trend endpoint — the AQI trend chart is derived client-side by
sorting the visit list by `startTime`. All of this mapping lives in
`normalizeLocations` / `normalizeTrend` / `normalizeBreakdown` /
`normalizeSummary` in `src/api/aqiApi.js`.

His "today" is a fixed mock date (`2026-09-26`), not the live clock — the
date picker defaults to that.

## What's built
- Dashboard shell: header + date picker, map panel, summary card, two charts
- Interactive map (Leaflet + OpenStreetMap, no API key) with AQI-color-coded markers and popups
- AQI trend line chart + exposure-breakdown bar chart (Recharts), both derived from his real visit data
- Date selection that reloads everything for the picked day
- Loading skeleton + error state with retry — errors show his backend's actual message (e.g. "No data found for date X. Available dates: ...")
- Fully responsive (single column on mobile, two-column on desktop)

## Where to make it yours
- Palette/fonts: `tailwind.config.js` (colors) and `index.html` (Google Fonts link)
- AQI band colors (labels are locked to match his backend exactly): `src/data/aqiBands.js`
- Map starting zoom/tile style: `src/components/MapPanel.jsx`
