/**
 * routes/exposure.js
 *
 * Mounts the exposure endpoints:
 *   GET /api/exposure/today    → getToday
 *   GET /api/exposure/history  → getHistory
 *   GET /api/exposure/:date    → getExposureByDate
 *
 * CRITICAL: "today" and "history" must be defined BEFORE "/:date".
 * Express matches routes in registration order.  If "/:date" were first,
 * the literal string "today" would be captured as the date parameter and
 * routed to getExposureByDate, which would then fail date validation.
 */
'use strict';

const express = require('express');
const {
  getToday,
  getHistory,
  getExposureByDate,
} = require('../controllers/exposureController');

const router = express.Router();

// ── Literal routes first ──────────────────────────────────────────────────
router.get('/today',   getToday);
router.get('/history', getHistory);

// ── Parameterised route last ──────────────────────────────────────────────
router.get('/:date',   getExposureByDate);

module.exports = router;
