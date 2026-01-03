const express = require('express');
const router = express.Router();
const controller = require('../controllers/student.controller');

router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.post('/interest', controller.submitInterest);
router.get('/dashboard/:id', controller.getDashboard);

module.exports = router;
