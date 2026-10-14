import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pkg;
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function run() {
  await client.connect();
  
  await client.query(`DELETE FROM admins WHERE id = 'ADM-1000'`);
  
  const res = await client.query(`
    UPDATE admins 
    SET name = 'Nikhil Hirwania', email = 'hirwanianikhil25@gmail.com' 
    WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  `);
  
  console.log('Admins updated:', res.rowCount);
  await client.end();
}
run().catch(console.error);
