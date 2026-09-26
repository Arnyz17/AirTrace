'use strict';

const { Router } = require('express');
const { getOverview, getDailyAnalyticsForDate } = require('../controllers/analyticsController');

const router = Router();

// IMPORTANT: 'overview' must be registered before '/:date' so Express does not
// treat the literal string "overview" as a date parameter.
router.get('/overview', getOverview);
router.get('/daily/:date', getDailyAnalyticsForDate);

module.exports = router;
