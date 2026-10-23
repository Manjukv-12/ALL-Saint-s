# Church management — setup guide

Frontend: `ALL-Saint-s` · Backend: `backend-php` · Database: MySQL

---

## One command (local)

From the **ALL-Saint-s** folder:

```bash
npm run setup:church-mgmt
```

This will:

1. Create the local MySQL database (`projectdb_local` by default)
2. Apply all church-management tables and migrations
3. Create the admin user and certificate templates
4. Ensure `.env.development` exists for the frontend

Then start both servers:

```bash
npm start
```

Open: **http://127.0.0.1:5173/#/admin/church-management/login**

| Field | Default |
|-------|---------|
| Email | `admin@csiallsaints.local` |
| Password | `ChangeMe123!` |

Change the password after first login in production.

---

## Local config files

### `backend-php/config.local.php`

Copy from `config.local.example.php` if missing. Edit to match your MySQL:

```php
$DB_HOST = '127.0.0.1';
$DB_PORT = 3307;          // XAMPP often uses 3307
$DB_NAME = 'projectdb_local';
$DB_USER = 'root';
$DB_PASS = '';

$FRONTEND_ORIGIN = 'http://127.0.0.1:5173';
$PUBLIC_API_BASE_URL = 'http://127.0.0.1:8080';
```

### `ALL-Saint-s/.env.development`

```env
VITE_API_URL=http://127.0.0.1:8080
VITE_API_LOCAL_PROXY_TARGET=http://127.0.0.1:8080
```

### `ALL-Saint-s/.env.production` (for Hostinger build)

```env
VITE_API_URL=https://csiallsaintstcr.com/backend-php
```

---

## Manual backend setup

If you prefer step by step, from `backend-php`:

```bash
php bin/setup-local-church-mgmt.php
```

Or only seed tables + admin:

```bash
php bin/seed-church-mgmt-admin.php
php bin/run-dues-migration.php
```

---

## Production (Hostinger)

Deploy **both** frontend and backend together.

### 1. Upload backend-php

Upload the full `backend-php` folder to `public_html/backend-php` (or your API path), including:

- `api/church-management.php` and all `church-management-*.php` files
- `router.php`, `config.php`, `lib/church-mgmt/`
- `sql/` folder (for reference)

### 2. Database on Hostinger

In **phpMyAdmin**, select your production database and run (in order):

1. `sql/church-management-tables.sql`
2. `sql/church-management-membership-migration.sql`
3. `sql/church-management-life-events-migration.sql`
4. `sql/church-management-family-inactive-migration.sql`
5. `sql/church-management-marriage-family-migration.sql`

Then via SSH (if available):

```bash
cd public_html/backend-php
php bin/run-dues-migration.php
php bin/seed-church-mgmt-admin.php
```

Or use phpMyAdmin to run the SQL files and create admin via `bin/seed-church-mgmt-admin.php` on a machine that can reach the production DB.

### 3. Build and upload frontend

```bash
cd ALL-Saint-s
npm run build
```

Upload **contents of `dist/`** into `public_html` (merge with existing site; do not overwrite `backend-php/`, `config.php`, or `.htaccess`).

### 4. Verify production

- `https://csiallsaintstcr.com/backend-php/api/church-management/stats` → should return `401` (route exists)
- `https://csiallsaintstcr.com/#/admin/church-management/login` → log in

---

## Daily development

| Command | What it does |
|---------|----------------|
| `npm start` | PHP API on `:8080` + Vite on `:5173` |
| `npm run api:php` | PHP API only |
| `npm run dev` | Frontend only (API must already be running) |
| `npm run setup:church-mgmt` | Re-run DB setup / migrations |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MySQL connection failed | Start MySQL (XAMPP). Check `config.local.php` port/user/password. |
| `pdo_mysql NO` | Enable `extension=pdo_mysql` in `php.ini`. |
| Dashboard empty / API error | Run `npm run setup:church-mgmt`. Ensure `npm run api:php` is running. |
| Login fails | Default: `admin@csiallsaints.local` / `ChangeMe123!`. Reset: `php bin/reset-church-mgmt-password.php`. |
| CORS errors in dev | `FRONTEND_ORIGIN` in `config.local.php` must match Vite URL (`http://127.0.0.1:5173`). |
