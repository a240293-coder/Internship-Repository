// Minimal local backend server for development
// Provides simple /student and /mentor auth endpoints used by the frontend.

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const dataFile = path.join(__dirname, 'dev-users.json');

const makeToken = () => crypto.randomBytes(16).toString('hex');

// Simple persistent stores backed by a JSON file so data survives restarts
let students = {};
let mentors = {};
let forms = {};

const saveData = () => {
	try {
		fs.writeFileSync(dataFile, JSON.stringify({ students, mentors, forms }, null, 2));
	} catch (err) {
		console.error('Failed to save backend data:', err.message || err);
	}
};

const parseInterests = (value) => {
	if (Array.isArray(value)) return value;
	if (typeof value === 'string') {
		if (!value.trim()) return [];
		try {
			return JSON.parse(value);
		} catch (err) {
			return value
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);
		}
	}
	return [];
};

const loadData = () => {
	try {
		if (fs.existsSync(dataFile)) {
			const raw = fs.readFileSync(dataFile, 'utf8');
			const parsed = JSON.parse(raw || '{}');
			students = parsed.students || {};
			mentors = parsed.mentors || {};
			forms = parsed.forms || {};
		}
	} catch (err) {
		console.error('Failed to load backend data:', err.message || err);
		students = {};
		mentors = {};
	}
};

loadData();

// Basic request logging for debugging
app.use((req, res, next) => {
	console.log(`[DEV BACKEND] ${req.method} ${req.path}`);
	if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
		console.log('[DEV BACKEND] Body:', req.body);
	}
	next();
});

app.post('/student/auth/register', (req, res) => {
	const { name, email, password } = req.body || {};
	if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
	// prevent duplicate registration
	const exists = Object.values(students).find(s => s.email === email);
	if (exists) return res.status(409).json({ message: 'Email already registered' });
	const id = `stu_${Date.now()}`;
	students[id] = { id, name, email };
	saveData();
	return res.json({ token: makeToken(), student: { id } });
});

app.post('/mentor/auth/register', (req, res) => {
	const { name, email, password } = req.body || {};
	if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
	const exists = Object.values(mentors).find(m => m.email === email);
	if (exists) return res.status(409).json({ message: 'Email already registered' });
	const id = `men_${Date.now()}`;
	mentors[id] = { id, name, email };
	saveData();
	return res.json({ token: makeToken(), mentor: { id } });
});

app.post('/student/auth/login', (req, res) => {
	const { email } = req.body || {};
	const found = Object.values(students).find(s => s.email === email);
	if (!found) return res.status(401).json({ message: 'Invalid credentials' });
	return res.json({ token: makeToken(), student: { id: found.id, email: found.email, name: found.name } });
});

app.post('/mentor/auth/login', (req, res) => {
	const { email } = req.body || {};
	const found = Object.values(mentors).find(m => m.email === email);
	if (!found) return res.status(401).json({ message: 'Invalid credentials' });
	return res.json({ token: makeToken(), mentor: { id: found.id, email: found.email, name: found.name } });
});

app.get('/health', (req, res) => res.json({ ok: true }));

// Student submits interest form
app.post('/forms/submit', (req, res) => {
	const { interests, desiredDomain, experience, goals, studentName, studentEmail, studentId } = req.body || {};
	if (!interests || !desiredDomain) return res.status(400).json({ message: 'Missing required fields' });
	const id = `form_${Date.now()}`;
	const now = new Date().toISOString();
	const parsedInterests = parseInterests(interests);
	forms[id] = {
		id,
		studentName: studentName || 'Anonymous',
		studentEmail: studentEmail || null,
		studentId: studentId || null,
		interests: parsedInterests,
		desiredDomain,
		experience: experience || '',
		goals: goals || '',
		status: 'assigned',
		createdAt: now,
	};
	saveData();
	return res.json({ message: 'Interest form submitted successfully', form: forms[id] });
});

// Mentor: get assigned students (for simplicity return all forms)
app.get('/mentor/students', (req, res) => {
	const { mentorId } = req.query || {};
	let list = Object.values(forms).sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
	if (mentorId) {
		list = list.filter(f => f.mentorId === mentorId || String(f.mentorId) === String(mentorId));
	}
	res.json(list);
});

// Student: get my form (return latest form if any)
app.get('/forms/my-form', (req, res) => {
	const { userId, email } = req.query || {};
	let list = Object.values(forms).sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
	if (userId) {
		list = list.filter(f => f.studentId === userId || f.studentId === String(userId));
	} else if (email) {
		list = list.filter(f => f.studentEmail === email);
	}
	if (list.length === 0) return res.status(404).json({ message: 'No form found' });
	return res.json(list[0]);
});

// Admin: assign mentor to a form (dev helper)
app.put('/admin/forms/:formId/assign-mentor', (req, res) => {
	const { formId } = req.params;
	const { mentorId, mentorName } = req.body || {};
	if (!forms[formId]) return res.status(404).json({ message: 'Form not found' });
	if (!mentorId) return res.status(400).json({ message: 'mentorId is required' });

	forms[formId].mentorId = mentorId;
	forms[formId].mentorName = mentorName || forms[formId].mentorName || null;
	forms[formId].status = 'assigned';
	saveData();
	res.json({ message: 'Mentor assigned successfully', form: forms[formId] });
});

// Mentor: update status for a form
app.put('/mentor/students/:formId/status', (req, res) => {
	const { formId } = req.params;
	const { status } = req.body || {};
	const { mentorId } = req.query || {};

	if (!forms[formId]) return res.status(404).json({ message: 'Form not found' });

	// Require mentorId to be provided and match the assigned mentor
	if (!mentorId) {
		return res.status(400).json({ message: 'mentorId is required' });
	}

	const assignedMentor = forms[formId].mentorId;
	if (!assignedMentor || String(assignedMentor) !== String(mentorId)) {
		return res.status(403).json({ message: 'Not authorized to update this student' });
	}

	forms[formId].status = status || forms[formId].status;
	saveData();
	res.json({ message: 'Status updated', form: forms[formId] });
});

app.listen(port, () => {
	console.log(`Dev backend listening on http://localhost:${port}`);
});

// Dev helper: seed a student quickly via query (for local testing)
app.get('/dev/seed-student', (req, res) => {
	const { email, name } = req.query || {};
	if (!email) return res.status(400).json({ message: 'Provide ?email=you@example.com' });
	const exists = Object.values(students).find(s => s.email === email);
	if (exists) return res.json({ message: 'Already exists', student: exists });
	const id = `stu_${Date.now()}`;
	students[id] = { id, name: name || 'Seeded Student', email };
	saveData();
	return res.json({ message: 'Seeded student', student: students[id] });
});
