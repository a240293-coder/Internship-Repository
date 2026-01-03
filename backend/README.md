# Backend README

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (use `.env.example` as template)

3. Ensure MongoDB is running

4. Start the server:
```bash
npm start
```

Server will run on port 5000 by default.

## Development

To run with auto-reload:
```bash
npm run dev
```

## API Routes

### Student
- POST /api/student/auth/register
- POST /api/student/auth/login

### Mentor
- POST /api/mentor/auth/register
- POST /api/mentor/auth/login

### Admin
- POST /api/admin/auth/login

### Forms
- POST /api/forms/submit
- GET /api/forms/my-form
- GET /api/admin/forms
- GET /api/admin/forms/pending
- PUT /api/admin/forms/:formId/assign-mentor

### Mentor Dashboard
- GET /api/mentor/students
- PUT /api/mentor/students/:formId/status
