// Run this script to add reset_token columns to the admins table
// Usage: node scripts/migrate-reset-token.js

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function migrate() {
    try {
        console.log('Running migration: add reset_token fields to admins...');

        await pool.query(`
            ALTER TABLE admins
              ADD COLUMN IF NOT EXISTS reset_token_hash  VARCHAR(64),
              ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_admins_reset_token
              ON admins (reset_token_hash)
              WHERE reset_token_hash IS NOT NULL;
        `);

        console.log('✅ Migration complete: reset_token_hash and reset_token_expiry columns added.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
