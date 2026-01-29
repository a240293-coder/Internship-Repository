const express = require('express');
const router = express.Router();
const adminDashboard = require('./adminDashboard');
router.use('/', adminDashboard);
module.exports = router;
