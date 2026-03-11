const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function initDb() {
  const createTable = `
    CREATE TABLE IF NOT EXISTS choir_registrations (
      id SERIAL PRIMARY KEY,
      choir_name VARCHAR(200) NOT NULL,
      choir_master_name VARCHAR(150) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL,
      email VARCHAR(150) NOT NULL,
      satb_notation_file VARCHAR(500) DEFAULT NULL,
      registration_fee_file VARCHAR(500) DEFAULT NULL,
      video_link VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(createTable);
  } catch (err) {
    console.error('Failed to create choir_registrations table:', err.message);
    throw err;
  }
}

module.exports = { pool, initDb };
