const express = require('express');
const router = express.Router();
const { assignMentor, getAssignmentHistory } = require('../controllers/admin.controller');
const roleAuth = require('../middleware/roleAuth');
const controller = require('../controllers/admin.controller');
const adminAuth = require('../middleware/adminAuth');
const { verifyToken } = require('../middleware/auth');
const { validatePagination, validateSearch, validateId, validateAssignment, validateLogin } = require('../middleware/inputValidation');
const { loginLimiter, apiLimiter } = require('../middleware/rateLimiter');
router.post('/assign', apiLimiter, verifyToken, roleAuth('admin'), validateAssignment, assignMentor);
router.get('/history', apiLimiter, verifyToken, roleAuth('admin'), getAssignmentHistory);
// Delete single history record
router.delete('/history/:id', apiLimiter, verifyToken, roleAuth('admin'), validateId, controller.deleteAssignmentHistory);
// Clear all assignment history
router.delete('/history', apiLimiter, verifyToken, roleAuth('admin'), controller.clearAssignmentHistory);
// Mark live session as completed
router.post('/live-sessions/:id/complete', apiLimiter, adminAuth, validateId, controller.markLiveSessionCompleted);
// Admin history and audit APIs
router.get('/history/completed-sessions', apiLimiter, adminAuth, validatePagination, validateSearch, controller.getCompletedSessions);
router.get('/history/mentor-assignments', apiLimiter, adminAuth, validatePagination, validateSearch, controller.getMentorAssignments);
router.get('/history/audit-logs', apiLimiter, adminAuth, validatePagination, validateSearch, controller.getAdminAuditLogs);

// Admin mentor detail endpoints
router.get('/mentors/:id', apiLimiter, adminAuth, validateId, controller.getMentorById);
router.get('/mentors/:id/sessions', apiLimiter, adminAuth, validateId, controller.getMentorSessionsAdmin);
router.get('/mentors/:id/students', apiLimiter, adminAuth, validateId, controller.getMentorStudentsAdmin);

router.post('/auth/login', loginLimiter, validateLogin, controller.login); // Super admin login
router.post('/auth/admin-login', loginLimiter, validateLogin, controller.adminLogin); // Regular admin login
router.get('/dashboard', apiLimiter, adminAuth, controller.getDashboard);
router.get('/live-sessions', apiLimiter, adminAuth, controller.getLiveSessions);
router.put('/live-sessions/:id/status', apiLimiter, adminAuth, validateId, controller.updateLiveSessionStatus);
router.get('/forms', apiLimiter, adminAuth, controller.getForms);
router.put('/forms/:id/assign-mentor', apiLimiter, adminAuth, validateId, controller.assignMentorToForm);

// Admin management routes (super admin only)
router.post('/create-admin', apiLimiter, adminAuth, controller.createAdmin);
router.get('/admins', apiLimiter, adminAuth, controller.getAllAdmins);
router.delete('/admins/:id', apiLimiter, adminAuth, validateId, controller.deleteAdmin);

module.exports = router;
