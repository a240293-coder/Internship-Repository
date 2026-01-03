const express = require('express');
const router = express.Router();
const controller = require('../controllers/liveSession.controller');

router.post('/book', controller.bookSession);

module.exports = router;
