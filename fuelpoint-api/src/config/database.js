import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
    host:     env.DB_HOST,
    port:     env.DB_PORT,
    database: env.DB_NAME,
    user:     env.DB_USER,
    password: env.DB_PASSWORD,
    max:      20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()')
    .then(() => console.log('✅ PostgreSQL connected'))
    .catch((err) => {
        console.error('❌ PostgreSQL connection failed:', err.message);
        process.exit(1);
    });

export const query = (text, params) => pool.query(text, params);
