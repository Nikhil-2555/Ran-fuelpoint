import { query } from './src/config/database.js';
import bcrypt from 'bcrypt';

async function test() {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Nikhil@123', salt);
        
        const updateResult = await query(
            `UPDATE admins 
             SET email = $1, password_hash = $2, updated_at = CURRENT_TIMESTAMP
             WHERE email = $3 OR email = $1
             RETURNING id, name, email`,
            ["hirwanianikhil25@gmail.com", passwordHash, "hirwanianikhil25@gmail.com"]
        );
        console.log("Admin updated:", updateResult.rows);
        process.exit(0);
    } catch (err) {
        console.error("DB Error:", err);
        process.exit(1);
    }
}
test();
