const db = require('../config/database');


const InterestForm = {
	async findAll(where = {}) {
		let sql = 'SELECT * FROM interest_forms';
		const params = [];
		const conditions = [];
		// Map JS property names to DB column names
		const columnMap = {
			mentorId: 'mentor_id',
			studentId: 'student_id',
			studentName: 'student_name',
			studentEmail: 'student_email',
			status: 'status',
			// add more mappings as needed
		};
		Object.keys(where).forEach((key) => {
			const dbCol = columnMap[key] || key;
			conditions.push(`${dbCol} = ?`);
			params.push(where[key]);
		});
		if (conditions.length) {
			sql += ' WHERE ' + conditions.join(' AND ');
		}
		console.log('[InterestForm SQL]', sql, params); // Debug log
		const [rows] = await db.query(sql, params);
		return rows;
	},

	async findOne(where = {}) {
		// Reuse findAll but return first match and normalize keys
		const rows = await this.findAll(where);
		const row = rows && rows.length ? rows[0] : null;
		if (!row) return null;
		const normalized = {
			...row,
			studentName: row.student_name || row.studentName || null,
			studentEmail: row.student_email || row.studentEmail || null,
			desiredDomain: row.desired_domain || row.desiredDomain || null,
			mentorId: row.mentor_id || row.mentorId || null,
			mentorName: row.mentor_name || row.mentorName || null,
			interests: (typeof row.interests === 'string') ? (JSON.parse(row.interests || '[]') || []) : (Array.isArray(row.interests) ? row.interests : row.interests)
		};
		return normalized;
	},

	async create(data = {}) {
		// Map JS keys to DB columns
		const columnMap = {
			studentId: 'student_id',
			studentName: 'student_name',
			studentEmail: 'student_email',
			interests: 'interests',
			desiredDomain: 'desired_domain',
			goals: 'goals',
			resumeUrl: 'resume_url',
			status: 'status',
			mentorId: 'mentor_id',
			mentorName: 'mentor_name'
		};
		const cols = [];
		const vals = [];
		Object.keys(data).forEach((k) => {
			if (columnMap[k]) {
				cols.push(columnMap[k]);
				let val = data[k];
				if (k === 'interests' && Array.isArray(val)) {
					val = JSON.stringify(val);
				}
				vals.push(val);
			}
		});
		if (!cols.length) throw new Error('No data provided for InterestForm.create');
		const placeholders = cols.map(() => '?').join(', ');
		const sql = `INSERT INTO interest_forms (${cols.join(',')}) VALUES (${placeholders})`;
		const [result] = await db.query(sql, vals);
		const insertedId = result.insertId;
		const [rows] = await db.query('SELECT * FROM interest_forms WHERE id = ?', [insertedId]);
		const row = rows[0];
		if (!row) return null;
		return {
			...row,
			studentName: row.student_name || row.studentName || null,
			studentEmail: row.student_email || row.studentEmail || null,
			desiredDomain: row.desired_domain || row.desiredDomain || null,
			mentorId: row.mentor_id || row.mentorId || null,
			mentorName: row.mentor_name || row.mentorName || null,
			interests: (typeof row.interests === 'string') ? (JSON.parse(row.interests || '[]') || []) : (Array.isArray(row.interests) ? row.interests : row.interests)
		};
	},
	async findByPk(id) {
		const sql = 'SELECT * FROM interest_forms WHERE id = ? LIMIT 1';
		const [rows] = await db.query(sql, [id]);
		return rows[0] || null;
	},
	// Add more helper functions as needed (findById, update, etc.)

};
module.exports = InterestForm;
