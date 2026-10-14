import fs from 'fs';
import path from 'path';
import { pool } from '../src/config/database.js';

async function runMigrations() {
    console.log('🚀 Starting database migrations...');
    const sqlDir = path.join(process.cwd(), 'sql');
    
    try {
        const files = fs.readdirSync(sqlDir)
            .filter(f => f.endsWith('.sql') && !f.includes('seed'))
            .sort();
            
        for (const file of files) {
            console.log(`Executing ${file}...`);
            const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
            await pool.query(sql);
            console.log(`✅ ${file} completed`);
        }
        
        console.log('✨ All migrations completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigrations();
