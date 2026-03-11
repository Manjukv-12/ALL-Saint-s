const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  try {
    await client.connect();
    await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'csiallsaints'}`);
    console.log('Database csiallsaints created.');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database csiallsaints already exists.');
    } else {
      console.error('Error:', err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main();
