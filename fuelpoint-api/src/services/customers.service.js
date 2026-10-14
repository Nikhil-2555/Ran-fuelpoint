import { query } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import bcrypt from 'bcrypt';

export const getCustomers = async (queryParams) => {
    const { page = 1, limit = 20, search, group_id, status, sort = 'registered_at', order = 'desc' } = queryParams;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        conditions.push(`(c.name ILIKE $${params.length} OR c.phone ILIKE $${params.length} OR c.email ILIKE $${params.length})`);
    }
    if (group_id) {
        params.push(group_id);
        conditions.push(`c.group_id = $${params.length}`);
    }
    if (status) {
        params.push(status);
        conditions.push(`c.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['registered_at', 'name', 'status', 'transactions'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'registered_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(`SELECT COUNT(*) FROM v_customer_summary c ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(limit), offset);
    const dataResult = await query(
        `SELECT * FROM v_customer_summary c ${where} ORDER BY ${sortCol} ${sortOrder} LIMIT $${params.length - 1} OFFSET $${params.length}`,
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

export const createCustomer = async (customerData) => {
    const { name, phone, email, vehicle, password, group_id, status } = customerData;

    // Basic validation
    if (!name || !phone || !email) {
        throw new ApiError(400, 'Name, phone, and email are required');
    }

    // Check if email or phone already exists
    const existingUser = await query(
        'SELECT id FROM customers WHERE email = $1 OR phone = $2',
        [email, phone]
    );

    if (existingUser.rows.length > 0) {
        throw new ApiError(400, 'Customer with this email or phone already exists');
    }

    // Generate CUS-XXXX ID
    const lastIdResult = await query(
        "SELECT id FROM customers WHERE id LIKE 'CUS-%' ORDER BY id DESC LIMIT 1"
    );
    let nextNum = 1000;
    if (lastIdResult.rows.length > 0) {
        const lastIdStr = lastIdResult.rows[0].id; // e.g., 'CUS-1005'
        const numPart = parseInt(lastIdStr.split('-')[1]);
        if (!isNaN(numPart)) {
            nextNum = numPart + 1;
        }
    }
    const newId = `CUS-${nextNum}`;

    // Hash password if provided
    let password_hash = null;
    if (password) {
        password_hash = await bcrypt.hash(password, 10);
    }

    // Default to 'grp-default' if no group provided
    const groupId = group_id || 'grp-default';

    const insertResult = await query(
        `INSERT INTO customers 
         (id, name, phone, email, vehicle, password_hash, group_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [newId, name, phone, email, vehicle || null, password_hash, groupId, status || 'active']
    );

    return insertResult.rows[0];
};

export const updateCustomer = async (id, updateData) => {
    const { name, phone, email, vehicle, group_id, status } = updateData;

    const existingUser = await query('SELECT id FROM customers WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
        throw new ApiError(404, 'Customer not found');
    }

    const updateResult = await query(
        `UPDATE customers 
         SET name = $1, phone = $2, email = $3, vehicle = $4, group_id = $5, status = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [name, phone, email, vehicle || null, group_id, status, id]
    );

    return updateResult.rows[0];
};

export const deleteCustomer = async (id) => {
    const existingUser = await query('SELECT id FROM customers WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
        throw new ApiError(404, 'Customer not found');
    }

    await query('DELETE FROM customers WHERE id = $1', [id]);
};
