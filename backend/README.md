# Choir Registration API (Backend)

Node.js API for choir registrations: multipart form (SATB + fee files), PostgreSQL storage, confirmation email, and admin list endpoint.

## Setup

1. **Install dependencies**
   ```bash
   cd backend && npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
  - Set PostgreSQL: `DB_HOST`, `DB_PORT` (default 5432), `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - Set `ADMIN_API_KEY` (used for GET `/api/choir-registrations` and `/api/uploads/:filename`)
  - Set SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (and optionally `SMTP_SECURE`, `FRONTEND_ORIGIN`)

3. **Database**
   - Create the database in PostgreSQL (local or cloud), then either:
     - Let the server create the table on startup (see `db.js`), or
     - Run `schema.sql` in your PostgreSQL client

4. **Run**
   ```bash
   npm run dev   # development with --watch
   npm start     # production
   ```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/choir-registration` | No | Submit registration (multipart: choir_name, choir_master_name, whatsapp, email, video_link; files: satb_notation, registration_fee_file) |
| GET | `/api/choir-registrations` | API key | List all registrations (for dashboard) |
| GET | `/api/uploads/:filename` | API key | Download an uploaded file |

**Admin auth:** `Authorization: Bearer <ADMIN_API_KEY>`, or header `x-api-key: <ADMIN_API_KEY>`, or query `?key=<ADMIN_API_KEY>`.

## Frontend

- Use this API base URL (e.g. `http://localhost:3001` in dev, or your Node host in production).
- In the **frontend** project root, create or edit `.env` and set `VITE_API_URL=http://localhost:3001` (or your backend URL).
- Restart the frontend dev server after changing `.env`.
- Dashboard page can call `GET /api/choir-registrations` with the admin key and link to `GET /api/uploads/:filename` for SATB and fee files.

## "Connection failed" / Works in another Cursor window

If the frontend shows **connection failed** but the same app works in another Cursor window:

1. **Start the backend in this window**  
   In a terminal: `cd backend` then `npm run dev`. You must see `Choir API running at http://localhost:3001`.

2. **Set the frontend API URL**  
   In the **project root** (not inside `backend`), ensure `.env` has:
   ```env
   VITE_API_URL=http://localhost:3001
   ```
   If `VITE_API_URL` is empty, the frontend will try to call the same origin (e.g. the Vite dev server), which has no API.

3. **Restart the frontend**  
   After adding or changing `VITE_API_URL`, restart `npm run dev` (or `yarn dev`) so Vite picks up the new env.

4. **Database**  
   If the backend exits immediately or logs a DB error, fix `backend/.env`: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (and `DB_PORT` for PostgreSQL). PostgreSQL must be running (e.g. local or cloud) and the database must exist.
