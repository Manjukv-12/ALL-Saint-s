# Match local work to Hostinger frontend

## What you want

You uploaded a **build** to Hostinger. The live site is that build + the **database** on the server.

## What is possible

| Goal | Possible? |
|------|-------------|
| Copy **exact** live pages (look & behavior) into a folder on your PC | **Yes** — download static files |
| Turn Hostinger JS back into full **editable** `src/` React code | **No** — no source maps on the server |
| Make your **current** `src/` match live closely | **Mostly yes** — same app; rebuild with `npm run build:prod` |

We compared live `index-CUD3C1J4.js` with `npm run build:prod` from this repo: same church-management API (49 paths on live). Local build is a few KB larger (extra health-tracker bits). **Live and this repo are the same project**, not two different apps.

## Download exact live frontend (snapshot)

From `ALL-Saint-s`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/pull-hostinger-frontend.ps1
```

Files go to `reference/hostinger-live-YYYY-MM-DD/`.

Preview that snapshot (exactly what Hostinger serves):

```powershell
npx --yes serve "reference/hostinger-live-YYYY-MM-DD" -p 4173
```

Open `http://127.0.0.1:4173/#/admin/church-management/members` (login uses **live API** on Hostinger).

## Editable local code (what you change in Cursor)

1. Work in **`src/`** in this repo.
2. Production build (same settings as Hostinger upload):

   ```powershell
   npm run build:prod
   ```

3. Upload `dist/` contents to Hostinger (or `npm run build:release` for the release folder).

To **see live data** while editing:

```powershell
npm run dev:live-api
```

## If local **looks** wrong but live looks right

Usually **local database is empty**, not missing frontend code. Use `dev:live-api` or fix local MySQL seed.

If a **specific button or page** is missing, name the screen — fix that file in `src/`, do not rely on unpacking `dist`.
