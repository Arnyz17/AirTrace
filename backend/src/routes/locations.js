/**
 * routes/locations.js — GET /api/locations/:date
 */
'use strict';

const express                  = require('express');
const { getLocationsByDate }   = require('../controllers/locationController');

const router = express.Router();

router.get('/:date', getLocationsByDate);

module.exports = router;
