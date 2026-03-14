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

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set API URL (create `.env` from `.env.example` if needed):
   ```env
   VITE_API_URL=http://localhost:3001
   ```
3. Start the Node backend (in another terminal):
   ```bash
   cd backend && npm install && npm run dev
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

---

## Build (production)

```bash
npm run build
```

Output is in **dist/**. For **Hostinger**, set `VITE_API_URL` to your live API URL (e.g. `https://yourdomain.com`) before building, then follow **DEPLOY-HOSTINGER.md** to upload the `dist/` contents and **backend-php**.
