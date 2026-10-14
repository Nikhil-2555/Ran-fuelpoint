import { query } from '../config/database.js';

export const getTransactions = async (queryParams) => {
    const { page = 1, limit = 20, customer_id, worker_id, sort = 'created_at', order = 'desc' } = queryParams;
    const offset = (Number(page) - 1) * Number(limit);
    
    const conditions = [];
    const params = [];

    if (customer_id) {
        params.push(customer_id);
        conditions.push(`customer_id = $${params.length}`);
    }
    if (worker_id) {
        params.push(worker_id);
        conditions.push(`worker_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(`SELECT COUNT(*) FROM transactions ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(limit), offset);
    
    const queryStr = `
        SELECT t.*, c.name as customer_name, w.name as worker_name
        FROM transactions t
        LEFT JOIN customers c ON t.customer_id = c.id
        LEFT JOIN workers w ON t.worker_id = w.id
        ${where}
        ORDER BY t.${sort === 'created_at' ? 'created_at' : 'created_at'} ${sortOrder}
        LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const dataResult = await query(queryStr, params);

    return {
        data: dataResult.rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
    };
};

export const createTransaction = async (transactionData) => {
    const { customer_id, worker_id, fuel_type, volume, amount, discount_amount } = transactionData;

    if (!customer_id || !worker_id || !amount || !volume || !fuel_type) {
        const error = new Error('Missing required fields');
        error.status = 400;
        throw error;
    }

    const customerResult = await query(
        `SELECT c.group_id, g.discount_percent 
         FROM customers c 
         LEFT JOIN discount_groups g ON c.group_id = g.id 
         WHERE c.id = $1`,
        [customer_id]
    );

    if (customerResult.rows.length === 0) {
        const error = new Error('Customer not found');
        error.status = 404;
        throw error;
    }

    const { group_id, discount_percent } = customerResult.rows[0];
    const txnId = 'TXN-' + Date.now() + Math.floor(Math.random() * 1000);

    const insertResult = await query(
        `INSERT INTO transactions (id, customer_id, worker_id, group_id, amount, discount_percent, discount_amount, litres, fuel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [txnId, customer_id, worker_id, group_id, amount, discount_percent || 0, discount_amount || 0, volume, fuel_type]
    );
    
    await query('UPDATE customers SET last_activity = NOW() WHERE id = $1', [customer_id]);
    await query('UPDATE workers SET last_activity = NOW() WHERE id = $1', [worker_id]);

    return insertResult.rows[0];
};
