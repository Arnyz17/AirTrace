'use strict';

const { Router } = require('express');
const { createVisit } = require('../controllers/visitsController');

const router = Router();

router.post('/', createVisit);

module.exports = router;
