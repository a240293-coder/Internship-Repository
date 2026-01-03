const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');

router.post('/auth/login', controller.login);
router.get('/dashboard', controller.getDashboard);
router.get('/live-sessions', controller.getLiveSessions);
router.put('/live-sessions/:id/status', controller.updateLiveSessionStatus);
router.get('/forms', controller.getForms);
router.put('/forms/:id/assign-mentor', controller.assignMentor);

module.exports = router;
