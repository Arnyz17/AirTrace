/**
 * routes/aqi.js
 *
 *   GET /api/aqi/categories         → AQI category reference table
 *   GET /api/aqi/live?lat=&lng=     → Live real-time AQI from Open-Meteo
 *   GET /api/aqi/:date              → AQI readings for a specific date
 */
'use strict';

const express = require('express');
const { getAQIByDate, getCategories } = require('../controllers/aqiController');
const { openMeteoAQIProvider }        = require('../providers/OpenMeteoAQIProvider');

const router = express.Router();

// Literal routes before parameterised route
router.get('/categories', getCategories);

/**
 * GET /api/aqi/live?lat=40.712&lng=-74.006
 *
 * Returns the current real-time US AQI (and PM2.5) for any coordinates.
 * Uses today's date for the Open-Meteo request and returns the closest
 * hourly reading to right now.
 */
router.get('/live', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, error: 'lat and lng query params are required.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const nowISO = new Date().toISOString();

  try {
    const readings = await openMeteoAQIProvider.getAQIReadingsForDateAsync(lat, lng, today);
    if (!readings || readings.length === 0) {
      return res.json({ success: true, data: { aqi: null, message: 'No AQI data available for this location.' } });
    }

    // Pick reading closest to current time
    const nowMs = Date.now();
    let best = readings[0];
    let bestDiff = Infinity;
    for (const r of readings) {
      const diff = Math.abs(new Date(r.timestamp).getTime() - nowMs);
      if (diff < bestDiff) { bestDiff = diff; best = r; }
    }

    res.json({
      success: true,
      data: {
        lat, lng,
        aqi:       best.aqi,
        pm25:      best.pm25,
        category:  best.category,
        timestamp: best.timestamp,
        source:    'open-meteo',
        fetchedAt: nowISO,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:date', getAQIByDate);

module.exports = router;
