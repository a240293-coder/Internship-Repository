const express = require('express');
const router = express.Router();
const controller = require('../controllers/mentor.controller');

router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.get('/dashboard/:id', controller.getDashboard);
router.get('/all', controller.getAllMentors);

module.exports = router;
