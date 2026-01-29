const express = require('express');
const router = express.Router();
const controller = require('../controllers/form.controller');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use absolute path to backend/uploads to avoid cwd issues
    const uploadsPath = path.join(__dirname, '../uploads');
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET /forms/my-form (fetch form data for student dashboard)
router.get('/my-form', controller.getForm);
// GET /forms/my-forms (fetch all forms for a student)
router.get('/my-forms', controller.getForms);

router.post('/submit', verifyToken, upload.single('resume'), controller.submitForm);

// Update existing form (students only)
router.put('/update', verifyToken, upload.single('resume'), controller.updateForm);

// Delete a form
router.delete('/:id', verifyToken, controller.deleteForm);

module.exports = router;