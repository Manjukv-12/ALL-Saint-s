# Deploy to Hostinger (Single Web Hosting)

This guide deploys the **complete project** (website + choir registration API) on Hostinger using **PHP + MySQL**. The database is managed by Hostinger inside your account.

---

## What you’re deploying

| Part | Technology | Where it runs |
|-----|------------|----------------|
| **Website (frontend)** | Vite build (HTML/JS/CSS) | Hostinger `public_html` |
| **API (backend)** | PHP + MySQL | Same Hostinger account (PHP in `public_html`, DB in hPanel) |

Your repo already contains:

- **Root** – frontend source (build output goes to `dist/`)
- **backend/** – Node.js API (for local dev only; not used on Hostinger)
- **backend-php/** – PHP API + MySQL schema (use this on Hostinger)

---

## Step 1: Create MySQL database (hPanel)

1. Log in to **hPanel** → **Databases** → **MySQL Databases**.
2. **Create a database** (e.g. `u123456789_csiallsaints` – Hostinger often adds a prefix).
3. **Create a user** and set a strong password.
4. **Add the user to the database** with **All privileges**.
5. Note: **Host** (usually `localhost`), **Database name**, **Username**, **Password**.

---

## Step 2: Create the table (phpMyAdmin)

1. In hPanel, open **phpMyAdmin** and select your database.
2. Go to the **SQL** tab and run:

```sql
CREATE TABLE IF NOT EXISTS choir_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  choir_name VARCHAR(200) NOT NULL,
  choir_master_name VARCHAR(150) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  satb_notation_file VARCHAR(500) DEFAULT NULL,
  registration_fee_file VARCHAR(500) DEFAULT NULL,
  video_link VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

(You can copy this from `backend-php/schema.sql`.)

---

## Step 3: Build the frontend for production

On your computer, in the **repo root** (where `package.json` and `src/` are):

1. Create or edit `.env` and set the **production API URL** (your Hostinger domain, no trailing slash):

   ```env
   VITE_API_URL=https://yourdomain.com
   ```

   Replace `yourdomain.com` with your actual domain (e.g. `https://allsaintscsi.com`).

2. Install and build:

   ```bash
   npm install
   npm run build
   ```

3. The built site will be in the **`dist/`** folder. You will upload this to Hostinger in the next step.

---

## Step 4: Upload to Hostinger

You need two things on the server:

- The **PHP API** (so the site can call `/api/...`).
- The **frontend build** (so visitors see the website).

### Option A: API and site on same domain (recommended)

Example: site at `https://yourdomain.com`, API at `https://yourdomain.com/api/...`.

1. In **File Manager** (or FTP), go to **public_html**.
2. **Upload the contents** of **backend-php** so that you have:
   - `public_html/config.php`
   - `public_html/api/` (with `health.php`, `choir-registration.php`, `choir-registrations.php`, `uploads.php`, etc.)
   - `public_html/uploads/` (empty folder, writable)
   - `public_html/.htaccess`
3. **Upload the contents** of **dist/** (from your frontend build) into **public_html**:
   - So `public_html/index.html`, `public_html/assets/`, etc. exist.
   - Do **not** overwrite `config.php`, `api/`, `uploads/`, or `.htaccess` when merging.

If your hosting uses a subfolder for the site, put the API in that same subfolder (e.g. same `public_html`).

### Option B: API in a subfolder

If you prefer the API under a path like `/backend/api/`:

1. Create `public_html/backend` and upload the **contents** of **backend-php** there (so you have `public_html/backend/config.php`, `public_html/backend/api/`, etc.).
2. Upload the **contents** of **dist/** into **public_html** as above.
3. When building the frontend, set:

   ```env
   VITE_API_URL=https://yourdomain.com/backend
   ```

   Then run `npm run build` again and re-upload the new `dist/` contents.

---

## Step 5: Configure the PHP backend

1. Open **config.php** (in `public_html` or `public_html/backend`, depending on Option A or B).
2. Set:

   - **$DB_HOST** – usually `localhost`
   - **$DB_NAME** – your MySQL database name from Step 1
   - **$DB_USER** – MySQL username
   - **$DB_PASS** – MySQL password
   - **$ADMIN_API_KEY** – a long random string (e.g. from a password generator). Used to protect the list of registrations and file downloads.
   - **$FRONTEND_ORIGIN** – your site URL, e.g. `https://yourdomain.com` (no trailing slash). Used for CORS.
   - **$MAIL_FROM** – e.g. `noreply@yourdomain.com`
   - **$MAIL_FROM_NAME** – e.g. `All Saints CSI Church`

3. Save the file.

4. Make sure the **uploads** folder is writable (e.g. 755 or 775).

---

## Step 6: SPA routing (optional)

If your site uses client-side routing (e.g. `/choir-registration`, `/gallery`), configure your server so that all non-file requests are served `index.html`. On Hostinger you can often do this in **File Manager** by adding or editing **.htaccess** in `public_html` so it does not break the API. For example, add **after** any existing rules (and only if your app is a single-page app):

```apache
# SPA fallback: serve index.html for routes that don't match files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^ index.html [L]
```

This sends unknown non-API requests to `index.html`. Adjust if your Hostinger setup already has other rewrite rules.

---

## Step 7: Verify

1. **API health:** Open `https://yourdomain.com/api/health` (or `https://yourdomain.com/backend/api/health` if you used Option B). You should see `{"ok":true}`.
2. **Website:** Open `https://yourdomain.com`. You should see the site; the choir registration form should submit to your PHP API.
3. **Admin:** Use your admin page with the same **VITE_ADMIN_API_KEY** (or enter the key manually). It should list registrations and allow file downloads.

---

## Summary

- **Complete project** = frontend (built from repo root) + **backend-php** (PHP + MySQL) on Hostinger.
- **Database** = MySQL created in hPanel, table from `backend-php/schema.sql`.
- **Config** = `backend-php/config.php` with DB details, `ADMIN_API_KEY`, `FRONTEND_ORIGIN`, and mail From.
- **Frontend** = build with `VITE_API_URL=https://yourdomain.com` (or `.../backend`), then upload `dist/` to `public_html`.

For more detail on the PHP API only, see **backend-php/README.md**.
