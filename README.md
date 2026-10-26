# Rashedul Islam portfolio

React, TypeScript, Vite and Tailwind serve the portfolio; the Express API runs locally or as a Netlify function. MongoDB Atlas stores shared portfolio content, publication status/order, citations, settings and private contact messages.

## Deploy to Netlify

Follow the full [MongoDB Atlas and Netlify deployment guide](docs/NETLIFY_MONGODB_DEPLOYMENT.md), including Atlas setup, private variables, one-time migration, build settings and live verification.

```text
Browser -> Netlify /api function -> MongoDB Atlas
```

The build command is `npm run build:netlify`, publish directory `dist`, and functions directory `netlify/functions`. The generated function is `api.cjs` (CommonJS). `.nvmrc` and `netlify.toml` select Node.js 22.

## Local setup

1. Run `npm ci`.
2. Fill in `.env.local`, using `.env.example` as a reference. Preserve existing credentials when editing an existing file.
3. Set `MONGODB_URI`, `MONGODB_DB=rashed_portfolio`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a random `JWT_SECRET` of at least 32 characters.
4. For a new empty database, copy data once: `npm run db:migrate -- --from data/portfolio.local.json`. Use a fresh full admin JSON export instead if it contains newer data. An existing MongoDB portfolio is never overwritten by this command.
5. Run `npm run db:check`, then `npm run dev`. Open `http://localhost:4000` when `PORT=4000` is set in `.env.local`.

Migration verifies the copy and leaves the source file untouched. Once configured, the server reads MongoDB instead of the local JSON file. A failed database read/write does not switch back to JSON.

## Environment and login

Development loads `.env` and then `.env.local`; the latter overrides defaults. Admin logins reread these files with dotenv parsing. Local credential changes through the admin are saved to `.env.local`.

Production uses Netlify's private hosting variables. Database, admin and JWT variables need Functions scope. Never prefix secrets with `VITE_`. `VITE_SITE_URL` is an optional public Build-scope URL for CV links. Local dotenv files are not deployed. Change production credentials in Netlify and redeploy.

`DATABASE_URL`, `DATABASE_URL_POOLED`, old Firebase credentials, `firebase-applet-config.json`, and `firestore.rules` are not active MongoDB storage configuration. Old Firebase configuration files are retained only for reference.

## Where data is saved

| Configuration | Active storage |
| --- | --- |
| `MONGODB_URI` configured | Database from `MONGODB_DB` (default `rashed_portfolio`), collection `portfolio`, document `_id: main` |
| No URI in local development | Ignored `data/portfolio.local.json`; `data/portfolio_db.json` is the initial development fallback |
| No URI in production | API initialization/saving fails; no temporary serverless-file database is used |

Content is under the document's `data` field. Login credentials are excluded. Related changes are saved atomically, and per-section version checks reject stale edits instead of overwriting newer edits. Every API request refreshes its saved snapshot. Public responses omit contact messages and legacy admin credentials.

**Admin -> Security & DB** shows active storage and credential sources. `/api/health` reports the storage type; protected `/api/admin/storage` supplies details without exposing the URI/password.

Download regular admin JSON backups before imports or major edits. The app reserves a 15 MiB content budget for its MongoDB document; keep large images/files as media URLs instead of embedding them in JSON.

## Verification

```powershell
npm run lint
npm test
npm run db:check
npm run build:netlify
```

Tests use an isolated MongoDB test server, not Atlas. Its binary may be downloaded on the first run; Netlify builds skip this test-only download.

The frontend reloads saved content on page load, focus, and periodically while visible. Background Scholar sync saves published-paper citations and summary statistics, preserves pending manual papers, and retains counts when Scholar is unavailable. This is periodic synchronization rather than a database change stream.
