/**
 * routes/aqi.js
 *
 *   GET /api/aqi/categories  → AQI category reference table
 *   GET /api/aqi/:date       → AQI readings for a specific date
 */
'use strict';

const express = require('express');
const { getAQIByDate, getCategories } = require('../controllers/aqiController');

const router = express.Router();

// Literal route before parameterised route
router.get('/categories', getCategories);
router.get('/:date',      getAQIByDate);

module.exports = router;
