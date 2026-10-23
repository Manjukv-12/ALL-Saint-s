# Church management — ALL-Saints + backend-php only

Families, members, fees, and certificates run on **your existing stack**. You do **not** need `church_project` or Node/PostgreSQL in daily use.

| Layer | Project | Role |
|--------|---------|------|
| Frontend | `C:\Users\edwin\CSI\ALL-Saint-s` | React module `src/modules/church-management/` |
| Backend | `C:\Users\edwin\CSI\backend-php` | MySQL API `/api/church-management/*` |

Public **Leadership** (`#/leadership`) and **Leadership admin** (`#/admin/leadership`) are separate CMS features and unchanged.

## URLs

- Staff hub → **Church management** → `#/admin/church-management`
- Login: `#/admin/church-management/login`

## One-time database setup

**Quick (recommended):** from `ALL-Saint-s`:

```bash
npm run setup:church-mgmt
```

**Manual:** from `backend-php` (with MySQL running and `config.local.php` pointing at your DB):

```bash
php bin/setup-local-church-mgmt.php
```

Full guide: **docs/SETUP-CHURCH-MGMT.md**

Default admin (override in `config.php` or pass args):

- Email: `admin@csiallsaints.local`
- Password: `ChangeMe123!`

Tables: `sql/church-management-tables.sql` (`cm_admins`, `cm_families`, `cm_persons`, …).

## Daily dev

```bash
# Terminal 1 — PHP API
cd C:\Users\edwin\CSI\ALL-Saint-s
npm run api:php

# Terminal 2 — React
npm run dev
```

Open `#/admin/church-management/login`.

## API prefix

Frontend calls `/api/church-management/...` on the same base as choir/events (`VITE_API_URL` → Vite proxy → PHP).

Examples:

- `POST /api/church-management/auth/login`
- `GET /api/church-management/stats`
- `GET /api/church-management/families`

## Family Health Tracker (from mConsent guide)

Adapted for **families** instead of dental practices:

- **Route:** `#/admin/church-management/health-tracker`
- **API:** `GET /api/church-management/health-tracker` (full report)
- **API:** `GET /api/church-management/health-tracker/at-risk`
- **API:** `GET /api/church-management/health-tracker/summary`
- **API:** `GET /api/church-management/health-tracker/{familyId}`

**Score (0–100)** uses: member engagement, fee completion, payment collection, monthly activity (fees/certificates), certificates, profile completeness.

**Segments:** Champion, Stable, Frustrated, Fading, At Risk, Ghosting (same rules as the PDF).

**Activity** replaces “logins”: counts fee/certificate updates per month (last 3 months) and weekly consistency (last 8 weeks).

## Implemented in PHP

- Family split (sons) — `POST /api/church-management/families/{id}/split`
- Daughter marriage — `POST /api/church-management/families/{id}/members/{memberId}/marry`
- Certificates CRUD, preview, generate, download
- Default templates (Marriage, Death, Baptism) — seeded by `php bin/seed-church-mgmt-admin.php`

### PDF downloads

For true PDF files, run in `backend-php` (PHP must have **openssl** enabled in `php.ini`):

```bash
php composer.phar install
```

**Certificates / PDF:** If Dompdf is not installed, downloads are HTML (Chrome cannot open them as `.pdf`). Use **Print / PDF** in the certificates list, or run `php bin/download-dompdf-vendor.php` in `backend-php` (works when Composer SSL fails). Then **Download** again for a real PDF. Regenerate one: `php bin/regenerate-certificate.php <uuid>`.

## Not ported yet

- Excel import, family accounts, website/notifications admin

## Re-sync UI from church_project

If you change Next.js pages in `church_project/frontend/app/admin`:

```bash
node scripts/convert-church-mgmt-pages.mjs
```

Then fix imports and `<Link>` tags as needed.
