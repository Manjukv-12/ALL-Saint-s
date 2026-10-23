# Frontend upload guide (Hostinger)

Quick dictionary for building and uploading **only the website + church admin UI**. Your **existing database data stays on the server** — this replaces HTML/JS/CSS files only.

---

## One command (recommended)

From **`ALL-Saint-s`** folder on your PC:

```powershell
npm run build:upload
```

This will:

1. Build with **`.env.production`** (`vite build --mode production`)
2. Copy **`dist/`** → **`CSI/release/frontend/`**
3. Create **`CSI/release/frontend-upload.zip`**
4. Write **`UPLOAD-README.txt`** inside the folder (API URL + checklist)

Skip rebuild if you already ran build:

```powershell
npm run build:upload -- -SkipBuild
```

Manual build only:

```powershell
npm run build:prod
```

Output is always in **`dist/`** (repo root).

---

## Before you build — check API URL

File: **`.env.production`** (repo root)

| Variable | Production example | Meaning |
|----------|-------------------|---------|
| `VITE_API_URL` | `https://csiallsaintstcr.com/backend-php` | Where the browser calls PHP (`/api/...`) |

- **No trailing slash** on the URL.
- Must match where **`backend-php`** actually lives on Hostinger (often `public_html/backend-php`).
- After changing `.env.production`, run **`npm run build:upload`** again (URL is baked into the JS bundle).

---

## What to upload on Hostinger

| Local (after `build:upload`) | Server destination |
|------------------------------|-------------------|
| Everything inside **`release/frontend/`** | **`public_html/`** (merge) |
| Or unzip **`release/frontend-upload.zip`** into **`public_html/`** | Same |

Typical files you **do** upload / overwrite:

- `index.html`
- `assets/` (whole folder — new hashed JS/CSS)
- `favicon.ico`, `robots.txt`, images at root, etc.
- `.htaccess` **only if** your deploy doc says to update SPA rules (see below)

---

## Do NOT delete or overwrite (merge upload)

Keep these on the server when uploading frontend:

| On server | Why |
|-----------|-----|
| **`backend-php/`** | PHP API + church management |
| **`backend-php/config.php`** | DB password, JWT, mail, super-admin emails |
| **`backend-php/uploads/`** | Uploaded photos/files |
| **`config.php`** at root | If you use root config (legacy choir) |

Uploading frontend **does not** touch MySQL — families, members, and fees remain.

---

## Upload steps (hPanel)

1. **Backup** (optional but good): hPanel → **Backups** or export DB.
2. On PC: **`npm run build:upload`**
3. hPanel → **File Manager** → **`public_html`**
4. Upload **contents** of `release/frontend/` (or extract zip).
5. Confirm **`assets/`** folder updated (check modified date).
6. Hard refresh browser: **Ctrl+F5** (or clear cache for the site).

---

## After upload — verify

| Check | URL |
|-------|-----|
| Public site | `https://csiallsaintstcr.com/` |
| API health | `https://csiallsaintstcr.com/backend-php/api/health` → `{"ok":true}` |
| Church admin | `https://csiallsaintstcr.com/admin/church-management/` |
| Login works | Same admin user as before |

If church admin shows **network / database failed**:

- Backend not updated or MySQL down — fix **`backend-php`**, not frontend.
- Wrong **`VITE_API_URL`** — fix `.env.production`, rebuild, re-upload.

---

## SPA routing (`.htaccess`)

Admin routes like `/admin/church-management/families/...` need **`index.html`** fallback.

In **`public_html/.htaccess`**, keep API paths excluded, e.g.:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend-php/
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^ index.html [L]
```

Adjust paths if your API folder name differs.

---

## Frontend + backend together

For a **full** release (PHP + frontend):

```powershell
npm run build:release
```

See **`DEPLOY-HOSTINGER.md`** and **`backend-php/README.md`**.

After backend deploy, run **`backend-php/bin/run-schema-sync.php`** once on the server (adds columns; does not wipe data).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Old UI after upload | Hard refresh; confirm new **`assets/index-*.js`** on server |
| Admin calls wrong host | Rebuild with correct **`VITE_API_URL`** |
| 404 on admin deep links | Fix **`.htaccess`** SPA rule |
| Features missing (filters, tree) | Upload **new frontend**; some features also need **new backend-php** |

---

## Folder map

```
ALL-Saint-s/
  .env.production          ← API URL for production build
  dist/                    ← vite output (after build)
  scripts/
    package-frontend-upload.ps1

CSI/release/               ← created by build:upload
  frontend/                ← upload THIS folder’s contents
  frontend-upload.zip
```
