# AirTrace — Backend API

> Personal Air Quality Exposure Tracker — Backend API (v1.1.0)

---

## Table of Contents

1. [Project Description](#project-description)
2. [Backend Responsibilities](#backend-responsibilities)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Folder Structure](#folder-structure)
6. [Database & Persistence](#database--persistence)
7. [Installation & Setup](#installation--setup)
8. [Starting the Server](#starting-the-server)
9. [Running Tests](#running-tests)
10. [Exposure Index Formula](#exposure-index-formula)
11. [AQI Categories](#aqi-categories)
12. [API Reference & Swagger Docs](#api-reference--swagger-docs)
13. [Error Handling Format](#error-handling-format)
14. [Frontend Integration Guide](#frontend-integration-guide)
15. [Future AQI API Integration](#future-aqi-api-integration)

---

## Project Description

AirTrace estimates how much air pollution a person was exposed to during their day based on:

- where they were (location coordinates + name)
- when they were there (start/end timestamps)
- how long they stayed (duration in minutes)
- the AQI (Air Quality Index) associated with that location and time

The backend processes location visit histories and produces an individualized **Exposure Index** profile for each day. The frontend visualises this as maps, charts, and dashboards.

---

## Backend Responsibilities

This backend is responsible for:

- **Persistence Layer**: SQLite database (`data/airtrace.db`) managed via `better-sqlite3` with prepared statements and transactions.
- **Data Pipelines**: Validation → AQI lookup → Exposure calculation → Pre-computed record persistence.
- **Exposure Index Calculation**: Duration-weighted exposure (`AQI × durationMinutes`).
- **Analytics Engine**: Cross-date trends, category breakdowns with percentages, location rankings, and best/worst day comparisons.
- **Visit Ingestion**: `POST /api/visits` endpoint to add new visits and process them dynamically.
- **API Documentation**: Interactive Swagger UI endpoint at `/api/docs`.
- **Structured Error Handling**: Unified machine-readable error codes (`error.code`).
- **Comprehensive Testing**: 212 tests across 12 test suites (100% passing).

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v26 / v18+ |
| HTTP Framework | Express.js v4 |
| Database | SQLite (`better-sqlite3`) |
| API Docs | Swagger UI (`swagger-ui-express` + OpenAPI 3.0) |
| Environment | `dotenv` |
| Test Runner | Jest v29 |
| API Testing | Supertest v7 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│               REST API & Swagger UI (Express)            │
│   Routes → Controllers → Middleware → Error Handler      │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                    Service Layer                        │
│   locationService, exposureService, analyticsService    │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                  AQI Provider Abstraction               │
│   AQIDataProvider interface → MockAQIDataProvider       │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│               SQLite Persistence Repositories           │
│   locationVisitRepo, aqiReadingRepo, exposureRecordRepo │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│               SQLite Database (data/airtrace.db)        │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
backend/
├── data/                          # SQLite database directory (.gitignore'd)
├── src/
│   ├── app.js                     # Express app configuration & middleware
│   ├── server.js                  # Server entry point
│   ├── config/
│   │   ├── constants.js           # Centralized thresholds & bounds
│   │   └── env.js                 # Environment config
│   ├── db/
│   │   ├── database.js            # SQLite connection singleton
│   │   ├── schema.js              # Table creation & indexes
│   │   ├── seed.js                # Database seeding script
│   │   └── repositories/          # SQLite data-access layer
│   │       ├── locationVisitRepository.js
│   │       ├── aqiReadingRepository.js
│   │       └── exposureRecordRepository.js
│   ├── errors/
│   │   ├── AppError.js            # Custom error class
│   │   └── errorCodes.js          # Registry of machine-readable error codes
│   ├── middleware/
│   │   └── errorHandler.js        # Centralized error handler middleware
│   ├── providers/
│   │   ├── AQIDataProvider.js     # Provider contract interface
│   │   └── MockAQIDataProvider.js # Mock implementation
│   ├── services/
│   │   ├── aqiService.js          # AQI thresholds & colors
│   │   ├── exposureService.js     # Exposure calculations
│   │   ├── aggregationService.js  # Summary aggregations
│   │   ├── locationService.js     # Pipeline orchestrator
│   │   └── analyticsService.js    # Trends & location rankings
│   ├── controllers/               # Route controllers (11 endpoints)
│   ├── routes/                    # Express routers
│   ├── swagger/
│   │   └── openapi.js             # OpenAPI 3.0 specification
│   └── utils/                     # Validation, dateUtils, responseHelpers
└── tests/                         # Unit, integration, & repository tests (212 tests)
```

---

## Database & Persistence

AirTrace uses SQLite for local persistence without requiring external DB servers.

Tables:
1. `location_visits`: User movements with timestamps, coordinates, and duration.
2. `aqi_readings`: Stored AQI readings for locations/dates.
3. `exposure_records`: Pre-computed exposure index values (`AQI × durationMinutes`).

Seeding:
```bash
npm run seed
```
Populates the database with 3 calendar days of sample location visits and AQI readings inside an atomic transaction.

---

## Installation & Setup

```bash
# Clone/navigate to project
cd AirTrace/backend

# Install dependencies
npm install

# Seed the SQLite database
npm run seed
```

---

## Starting the Server

```bash
# Start production server
npm start

# Development mode (auto-reload)
npm run dev
```

The API will be available at **http://localhost:3001**.
Swagger UI documentation will be live at **http://localhost:3001/api/docs**.

---

## Running Tests

```bash
npm test
```

Current test status: **212 tests passing across 12 test suites.**

---

## API Reference & Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server & DB health check |
| GET | `/api/docs` | Interactive Swagger UI |
| GET | `/api/exposure/today` | Summary for latest date |
| GET | `/api/exposure/history` | Compact summaries for all dates |
| GET | `/api/exposure/:date` | Full exposure detail for YYYY-MM-DD |
| GET | `/api/locations/:date` | Annotated visits for map rendering |
| GET | `/api/aqi/categories` | AQI reference table & hex colors |
| GET | `/api/aqi/:date` | AQI readings for a specific date |
| GET | `/api/analytics/overview` | Cross-date aggregate trends & statistics |
| GET | `/api/analytics/daily/:date` | Ranked location analytics & percentages |
| POST | `/api/visits` | Submit a new visit (runs pipeline & persists) |

---

## Error Handling Format

All endpoints use standard, structured JSON error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "date must be in YYYY-MM-DD format (e.g. 2026-09-25).",
    "status": 400
  }
}
```

The frontend can switch directly on `error.code` (e.g., `TIMESTAMP_ORDER_ERROR`, `INVALID_COORDINATES`, `DATE_NOT_FOUND`).

---

## Exposure Index Formula

> ⚠️ **IMPORTANT:** The Exposure Index is a **project-defined metric for AirTrace**. It is **NOT** a medical measurement.

```
Exposure Index = AQI × durationMinutes
```

Duration-Weighted Average AQI for a day:
```
weightedAverageAQI = Σ(AQI_i × duration_i) / Σ(duration_i)
```

---

## License & Project Info

Built for college project coursework & backend portfolio demonstration.
