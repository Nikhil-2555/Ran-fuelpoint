const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function run() {
  await client.connect();
  
  const res1 = await client.query(`
    UPDATE admins 
    SET name = 'Nikhil Hirwania', email = 'hirwanianikhil25@gmail.com' 
  `);
  console.log('Admins updated:', res1.rowCount);
  
  await client.end();
}
run().catch(console.error);
