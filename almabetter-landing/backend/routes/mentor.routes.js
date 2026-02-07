const express = require('express');
const router = express.Router();

const { updateStudentProgress } = require('../controllers/mentor.controller');
const roleAuth = require('../middleware/roleAuth');
const { verifyToken } = require('../middleware/auth');
// Removed: mentor dashboard student list endpoint (students are managed on the dedicated /mentor-dashboard route)
router.post('/progress', verifyToken, roleAuth('mentor'), updateStudentProgress);
const controller = require('../controllers/mentor.controller');

router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.get('/profile', verifyToken, controller.getProfile);
router.get('/dashboard/:id', verifyToken, controller.getDashboard);
router.get('/all', verifyToken, controller.getAllMentors);
// Mentor sessions: create and list
router.post('/sessions', verifyToken, roleAuth('mentor'), controller.createSession);
router.get('/sessions', verifyToken, roleAuth('mentor'), controller.getMentorSessions);
// Mark a mentor session as completed
router.post('/sessions/:id/complete', verifyToken, roleAuth('mentor'), controller.markSessionComplete);
// Update status (completed/canceled)
router.post('/sessions/:id/status', verifyToken, roleAuth('mentor'), controller.updateSessionStatus);

module.exports = router;
