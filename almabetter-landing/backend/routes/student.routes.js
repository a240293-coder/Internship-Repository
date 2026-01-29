const express = require('express');
const router = express.Router();
const controller = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.post('/interest', verifyToken, controller.submitInterest);
router.get('/dashboard/:id', verifyToken, controller.getDashboard);
// Student: get sessions (mentor meetings) created for the logged-in student
router.get('/sessions', verifyToken, controller.getSessions);

module.exports = router;
