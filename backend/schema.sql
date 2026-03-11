-- Run this in PostgreSQL (e.g. pgAdmin, psql) if you prefer to create the table manually.
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
);
