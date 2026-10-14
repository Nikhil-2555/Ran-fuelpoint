import { query } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import bcrypt from 'bcrypt';

export const getWorkers = async (queryParams) => {
    const { page = 1, limit = 20, search, status, shift, sort = 'joined_at', order = 'desc' } = queryParams;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        conditions.push(`(w.name ILIKE $${params.length} OR w.phone ILIKE $${params.length} OR w.email ILIKE $${params.length})`);
    }
    if (status) {
        params.push(status);
        conditions.push(`w.status = $${params.length}`);
    }
    if (shift) {
        params.push(shift);
        conditions.push(`w.shift = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['joined_at', 'name', 'status', 'scans'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'joined_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(`SELECT COUNT(*) FROM v_worker_summary w ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(limit), offset);
    const dataResult = await query(
        `SELECT * FROM v_worker_summary w ${where} ORDER BY ${sortCol} ${sortOrder} LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
    );

    return {
        data: dataResult.rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
    };
};

export const createWorker = async (workerData) => {
    const { name, email, phone, password, shift = 'Morning', status = 'active' } = workerData;

    if (!name || !email || !phone) {
        throw new ApiError(400, 'Name, email, and phone are required');
    }

    // Check if worker with email or phone exists
    const existing = await query(
        'SELECT id FROM workers WHERE email = $1 OR phone = $2',
        [email, phone]
    );

    if (existing.rows.length > 0) {
        throw new ApiError(400, 'Worker with this email or phone already exists');
    }

    // Generate WRK-XXXX ID
    const lastIdResult = await query(
        "SELECT id FROM workers WHERE id LIKE 'WRK-%' ORDER BY CAST(SUBSTRING(id FROM 5) AS INTEGER) DESC LIMIT 1"
    );
    let nextNum = 1000;
    if (lastIdResult.rows.length > 0) {
        const lastIdStr = lastIdResult.rows[0].id;
        const numPart = parseInt(lastIdStr.split('-')[1]);
        if (!isNaN(numPart)) {
            nextNum = numPart + 1;
        }
    }
    const newId = `WRK-${nextNum}`;

    let password_hash = null;
    if (password) {
        password_hash = await bcrypt.hash(password, 10);
    }

    const insertResult = await query(
        `INSERT INTO workers (id, name, email, phone, password_hash, shift, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, phone, shift, status, joined_at`,
        [newId, name, email, phone, password_hash, shift, status]
    );

    return insertResult.rows[0];
};

export const updateWorker = async (id, updateData) => {
    const { name, email, phone, shift, status } = updateData;

    const existingWorker = await query('SELECT id FROM workers WHERE id = $1', [id]);
    if (existingWorker.rows.length === 0) {
        throw new ApiError(404, 'Worker not found');
    }

    const updateResult = await query(
        `UPDATE workers 
         SET name = $1, email = $2, phone = $3, shift = $4, status = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, name, email, phone, shift, status`,
        [name, email, phone, shift, status, id]
    );

    return updateResult.rows[0];
};

export const deleteWorker = async (id) => {
    const existingWorker = await query('SELECT id FROM workers WHERE id = $1', [id]);
    if (existingWorker.rows.length === 0) {
        throw new ApiError(404, 'Worker not found');
    }

    await query('DELETE FROM workers WHERE id = $1', [id]);
};
