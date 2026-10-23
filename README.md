# CSI All Saints Church Thrissur – Sacred Light Web

Official website for CSI All Saints Church Thrissur (website + choir registration).

**URL**: https://Manjukv-12.github.io/ALL-Saint-s

---

## Project structure

| Folder / file | Purpose |
|---------------|--------|
| **Root** (`src/`, `index.html`, etc.) | Frontend (Vite). Build output: `dist/`. |
| **backend/** | Node.js + PostgreSQL API for **local development**. |
| **backend-php/** | **PHP + MySQL** API for **Hostinger** (Single Web Hosting). |
| **DEPLOY-HOSTINGER.md** | Step-by-step guide to deploy the **complete project** on Hostinger. |

For Hostinger, you use **backend-php** and the built frontend only (no Node on the server).

---

## Development (local)

1. Open a terminal in **ALL-Saint-s** (this folder) and install once:
   ```powershell
   cd C:\Users\edwin\CSI\ALL-Saint-s
   npm install
   ```
2. Start **PHP API + website** together (recommended):
   ```powershell
   npm start
   ```
   Run this from **`C:\Users\edwin\CSI\ALL-Saint-s`** (not `backend-php`).
   - PHP API: http://127.0.0.1:8080 (opens in a second PowerShell window)
   - Website: http://127.0.0.1:5173 (URL shown in the first terminal; if 5173 is busy, Vite uses 5174, etc.)

   Or run separately:
   ```powershell
   npm run api:php    # terminal 1 — PHP + MySQL API
   npm run dev        # terminal 2 — Vite frontend
   ```

3. API URL is already set in `.env.development` for local PHP (`http://127.0.0.1:8080`). Copy `.env.example` to `.env` only if you need extra keys (admin, Formspree).

**Requirements:** Node.js, PHP with `pdo_mysql` (XAMPP is fine), MySQL with `backend-php/config.php` configured.

---

## Build (production)

```bash
# Frontend only → dist/
npm run build:prod

# Frontend + backend package → ../release/
npm run build:release
```

- Uses `.env.production` (`VITE_API_URL=https://csiallsaintstcr.com/backend-php`).
- Output: `C:\Users\edwin\CSI\release\frontend` and `...\release\backend-php`.
- Upload frontend contents to `public_html/`, backend contents to `public_html/backend-php/`.
- See **DEPLOY-HOSTINGER.md** for Hostinger steps.
