const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const { pool, initDb } = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg'];
const allowedExt = ['.pdf', '.jpg', '.jpeg'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = allowedMimes.includes(file.mimetype) || allowedExt.includes(ext);
    cb(ok ? null : new Error('Only PDF and JPEG allowed'), ok);
  },
});

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());

function getAdminKey(req) {
  return req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '') || req.query.key;
}

function requireAdmin(req, res, next) {
  if (getAdminKey(req) === process.env.ADMIN_API_KEY) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post(
  '/api/choir-registration',
  upload.fields([
    { name: 'satb_notation', maxCount: 1 },
    { name: 'registration_fee_file', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const choir_name = (req.body.choir_name || '').trim();
      const choir_master_name = (req.body.choir_master_name || '').trim();
      const whatsapp = (req.body.whatsapp || '').trim();
      const email = (req.body.email || '').trim();
      const video_link = (req.body.video_link || '').trim();

      if (!choir_name || !choir_master_name || !whatsapp || !email) {
        return res.status(400).json({ error: 'Missing required fields: choir_name, choir_master_name, whatsapp, email' });
      }

      const satbFile = req.files?.satb_notation?.[0];
      const feeFile = req.files?.registration_fee_file?.[0];
      const satb_notation_file = satbFile ? path.basename(satbFile.path) : null;
      const registration_fee_file = feeFile ? path.basename(feeFile.path) : null;

      const result = await pool.query(
        `INSERT INTO choir_registrations (choir_name, choir_master_name, whatsapp, email, satb_notation_file, registration_fee_file, video_link)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [choir_name, choir_master_name, whatsapp, email, satb_notation_file, registration_fee_file, video_link || null]
      );

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Choir Registration Received – All Saints CSI Church',
        text: `Dear ${choir_master_name},\n\nThank you for registering your choir "${choir_name}" with us. We have received your registration and will be in touch.\n\nBest regards,\nAll Saints CSI Church`,
        html: `<p>Dear ${choir_master_name},</p><p>Thank you for registering your choir <strong>${choir_name}</strong> with us. We have received your registration and will be in touch.</p><p>Best regards,<br/>All Saints CSI Church</p>`,
      }).catch((mailErr) => {
        console.error('Email send failed:', mailErr.message);
      });

      res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed', message: err.message });
    }
  }
);

app.get('/api/choir-registrations', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, choir_name, choir_master_name, whatsapp, email, satb_notation_file, registration_fee_file, video_link, created_at FROM choir_registrations ORDER BY created_at DESC'
    );
    res.json({ count: rows.length, registrations: rows });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

app.get('/api/uploads/:filename', requireAdmin, (req, res) => {
  const file = path.join(UPLOAD_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(file);
});

async function start() {
  try {
    await initDb();
    console.log('Database connected.');
  } catch (err) {
    console.warn('Database not connected (start PostgreSQL and set .env):', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Choir API running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
