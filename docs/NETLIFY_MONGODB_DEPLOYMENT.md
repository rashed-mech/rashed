# Deploy your portfolio with MongoDB Atlas and Netlify

This guide takes the existing portfolio from local JSON storage to a shared MongoDB Atlas database and a Netlify deployment. Your current data is not moved or deleted automatically. Create Atlas, copy the data once, verify it, and then deploy the site against the same database.

**Current workspace:** the Atlas connection and initial data migration have already been verified. Do not run migration again. Continue with the Netlify repository and environment setup at steps 9–11; the earlier steps remain here for future reference.

The finished connection is:

```text
Visitor or admin browser → Netlify /api function → MongoDB Atlas
```

The browser never receives the MongoDB connection string. MongoDB stores portfolio content, publication status and order, citations, skills, settings, and contact messages. Images remain image URLs or files in public/media. Login credentials stay in private environment variables, separate from portfolio data.

## 1. Save a current backup

1. Open the existing local portfolio at `http://localhost:4000/admin`.
2. Open **Security & DB** and download the full JSON backup.
3. Keep that download somewhere private. The local working data is also in `data/portfolio.local.json`.
4. Avoid admin edits between making the backup and completing the initial migration. If the online site contains newer data than the local site, export from that online admin and use that export as the migration source instead.

The migration command reads the file; it does not modify it. It refuses to overwrite an existing MongoDB portfolio.

## 2. Create an Atlas project and cluster

1. Sign in at [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a project for the portfolio.
3. Create a cluster. Choose an available cluster tier and a region close to the region you will use for Netlify Functions. Wait until the cluster is ready.
4. Create a **database user**, such as `portfolio_app`. This is separate from your Atlas account and your portfolio admin login.
5. Give that database user read/write access to the database named `rashed_portfolio`. Atlas supports built-in roles, custom roles, and specific privileges; restrict this user to the portfolio database rather than granting administrative access.

MongoDB explains the distinction and permission settings in [Configure Database Users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/).

## 3. Configure network access

In Atlas, open the project's **Network Access / IP Access List**:

- Add your current public IP address so your computer can run the migration.
- For Netlify, allow the outbound addresses of the functions that connect to Atlas. If your Netlify account has **Private Connectivity**, allow its documented static IP addresses for the selected region.
- Without stable outbound addresses, a common serverless setup is an Atlas `0.0.0.0/0` entry. This allows connections from any IPv4 address, so use a strong database password, the restricted database user above, and TLS. It is broader network access than allowing specific IPs; choose static/private connectivity when available.

Atlas accepts connections only from its access list. See [Atlas cluster connections](https://www.mongodb.com/docs/atlas/driver-connection/) and [Netlify Private Connectivity](https://docs.netlify.com/manage/security/private-connectivity/).

## 4. Copy the driver connection string

1. On the cluster, select **Connect → Drivers**.
2. Choose Node.js and copy the `mongodb+srv://` connection string.
3. Replace the username/password placeholders with the database user's credentials. URL-encode special characters in the username/password; do not URL-encode the entire URI. Do not use your Atlas account password or your portfolio admin password here.

Example shape only:

```dotenv
MONGODB_URI="mongodb+srv://portfolio_app:ENCODED_DATABASE_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB=rashed_portfolio
```

MongoDB documents connection-string setup and escaping in [Configure Cluster Access](https://www.mongodb.com/docs/atlas/security/quick-start/).

## 5. Set local variables

Open `.env.local` in the project folder. The MongoDB keys have already been added with an empty URI. Fill them in; keep the existing admin credentials and `PORT`:

```dotenv
MONGODB_URI="YOUR_COMPLETE_ATLAS_CONNECTION_STRING"
MONGODB_DB=rashed_portfolio
ADMIN_USERNAME="YOUR_PORTFOLIO_ADMIN_USERNAME"
ADMIN_PASSWORD="YOUR_PORTFOLIO_ADMIN_PASSWORD"
JWT_SECRET="YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS"
PORT=4000
```

If `JWT_SECRET` is already set in `.env`, you can keep it there locally; `.env.local` overrides `.env`. For a new secret, run this locally and copy the result into your private settings:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Do not place any secret in a variable beginning with `VITE_`. These private files are ignored by Git. `DATABASE_URL`, `DATABASE_URL_POOLED`, and old Firebase credentials are not used by this MongoDB implementation.

## 6. Install and migrate the saved content

Use Node.js 22, matching the project's `.nvmrc` and Netlify build configuration. Open PowerShell in `D:\Portfolio\Portfolio_Rashed`:

```powershell
npm ci
npm run db:migrate -- --from data/portfolio.local.json
npm run db:check
```

To use the freshly downloaded backup instead, replace the migration command with:

```powershell
npm run db:migrate -- --from "C:\Users\Rashe\Downloads\YOUR_BACKUP.json"
```

Successful migration prints a verified copy message and content counts. The source file remains unchanged. `db:check` reads back the stored portfolio without printing the URI or passwords.

In Atlas **Browse Collections / Data Explorer**, you should now find:

| Item | Value |
| --- | --- |
| Database | `rashed_portfolio` |
| Collection | `portfolio` |
| Document `_id` | `main` |
| Portfolio content | `data` |
| Update counters | `versions` |
| Last save time | `updatedAt` |

The counters let the server reject a stale edit instead of overwriting a newer edit from another tab. A single atomic MongoDB update saves related changes, such as publication citations and their profile totals, together.

If migration says the portfolio already exists, it has not overwritten anything. Run `db:check`, review the existing Atlas data, and use the admin's backup/import feature only if you intend to replace content. Alternatively, use a different database name for a fresh test.

## 7. Verify locally against Atlas

1. Stop the old local server with Ctrl+C and start it again with `npm run dev`.
2. Open `http://localhost:4000/api/health`. Its `storage.type` must be `mongodb`, with `databaseId` equal to `rashed_portfolio`.
3. Sign into the admin. **Security & DB → Current Data Storage** must show MongoDB and `rashed_portfolio.portfolio / document main`.
4. Make a small identifiable edit. Refresh the portfolio in another tab and verify the new value in Atlas under `data`.
5. Restart the server and confirm the edit is still present. Restore the test value if needed.

When `MONGODB_URI` is configured, a failed MongoDB connection does not fall back to JSON. Without a URI, local development can still use your original JSON file, but production refuses database access.

## 8. Check the deployment build

```powershell
npm run lint
npm test
npm run build:netlify
```

Tests use a temporary MongoDB instance, not your Atlas database. The first test run may download a MongoDB test binary. Netlify builds skip that download and do not run the tests automatically.

Build outputs are `dist/` and `netlify/functions/api.cjs`. The `.cjs` entry is intentional: the project uses ES modules, while the bundled Lambda handler is CommonJS. Netlify [determines module format from the file extension](https://docs.netlify.com/build/functions/configuration/).

## 9. Put the source in a Git repository

Create a private repository with your Git provider and push the project source. Include `package-lock.json`, `netlify.toml`, `.nvmrc`, `api-src/`, `scripts/`, `src/`, and `public/` along with the remaining source files.

Do not commit `.env`, `.env.local`, local JSON storage, downloaded backups, `node_modules`, test binaries, or generated build output. The project `.gitignore` covers these standard locations. Review staged files before committing, especially any manually named backup files.

Do not deploy by dragging only `dist/` into Netlify: that omits the server function. Use the Git-connected build below so both the frontend and API are deployed.

## 10. Create or update the Netlify project

1. Sign into Netlify and import the existing Git repository, or connect the repository to your existing Netlify project.
2. Use the repository root as the base directory.
3. Verify these settings from `netlify.toml`:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm run build:netlify` |
   | Publish directory | `dist` |
   | Functions directory | `netlify/functions` |
   | Build Node.js version | `22` |

4. Under the project's **Environment variables**, add the following private runtime values for the **Production** deploy context. Use the same Atlas URI and database name that passed local verification.

   | Variable | Value | Scope |
   | --- | --- | --- |
   | `MONGODB_URI` | Complete Atlas URI | Functions |
   | `MONGODB_DB` | `rashed_portfolio` | Functions |
   | `ADMIN_USERNAME` | Portfolio admin username | Functions |
   | `ADMIN_PASSWORD` | Portfolio admin password | Functions |
   | `JWT_SECRET` | Random secret, at least 32 characters | Functions |
   | `NODE_ENV` | `production` | Functions |
   | `AWS_LAMBDA_JS_RUNTIME` | `nodejs22.x` | Builds |
   | `VITE_SITE_URL` | Your final HTTPS portfolio URL | Builds, optional |
   | `GEMINI_API_KEY` | Your key if using AI extraction | Functions, optional |

5. If your account only offers all scopes, use that option for the necessary variables and keep secrets unprefixed. The build configuration includes `NPM_FLAGS=--include=dev` so required build tools are installed even when production mode is applied to builds.
6. Save the settings and trigger a new deployment. Updating function variables requires a new deploy. Local `.env.local` is not uploaded to Netlify.

Netlify documents [function variable scopes and redeploys](https://docs.netlify.com/build/functions/environment-variables/) and [Node.js dependency settings](https://docs.netlify.com/build/configure-builds/manage-dependencies/). Variables in `netlify.toml` are build configuration, not a substitute for private function variables.

Do not run the migration as the Netlify build command. It is a one-time, verified copy, not a per-deployment reset. Use a separate database and credentials for preview deployments if you enable their API; do not point untrusted previews at production data.

## 11. Verify the live deployment

1. Open `https://YOUR_SITE.netlify.app/api/health`. Confirm `status: ok` and `storage.type: mongodb`.
2. Open `/api/portfolio`. It should return JSON, not the SPA's HTML page.
3. Sign into `/admin` with the credentials set in Netlify, then check **Security & DB**.
4. Make a small edit, refresh in a private browser tab, and verify the value in Atlas. The local site also sees this edit when it points at the same Atlas database.
5. Reorder a publication and confirm the website and downloaded CV follow the saved order.
6. Submit a test contact message. Confirm it appears in admin, while public `/api/portfolio` does not contain messages or admin credentials.
7. Trigger another Netlify deployment without migrating again. Confirm the edited data survives. Redeploys replace code and assets; they do not reset MongoDB.

To publish a manually prepared resume, use **Admin → Researcher Profile → Research Resume PDF** to upload and save a PDF (up to 3 MiB). The homepage **Research Resume** button downloads it. This is independent of the automatically generated **Download CV**. The file is stored in MongoDB and included in full admin backups, so replacing or uploading it does not require another deployment.

Citation sync retains saved counts if Google Scholar is temporarily unavailable. Open tabs refresh on focus and periodically while visible; this is polling rather than an instantaneous MongoDB change stream.

## 12. Troubleshoot and maintain the site

| Symptom | Check |
| --- | --- |
| API returns 503 | Verify Functions-scope MongoDB variables, network access, database-user permissions, and that migration completed. Review Netlify function logs. |
| MongoDB is connected but empty | Confirm `MONGODB_DB` matches the name used during migration, then run `db:check`. |
| Authentication failure in `db:check` | Use the Atlas database user, URL-encode special characters, and verify the URI. |
| Local works, Netlify fails | Netlify needs its own private variables and permitted Atlas network access; it cannot read your computer's `.env.local`. |
| Admin login fails online | Use Netlify's runtime `ADMIN_USERNAME` and `ADMIN_PASSWORD`, then redeploy if changed. Local settings are separate. |
| A stale-save conflict appears | Refresh the admin before retrying. The server has preserved the newer saved edit. |
| `/api/portfolio` returns HTML | Verify the `/api/*` redirect precedes the SPA fallback, and that the `api` function was deployed. |
| Build tools are missing | Keep Node 22 and `NPM_FLAGS=--include=dev`; commit the lockfile. |
| Large image upload fails | Prefer media URLs or files in `public/media`; keep large assets out of the portfolio JSON. This implementation reserves a 15 MiB content limit within MongoDB's document limit. |

Download regular full backups from **Security & DB**. Keep a copy before bulk imports and major edits. Your original local JSON remains a backup after migration, but it stops being the live store once MongoDB is configured. Old Firestore and PostgreSQL settings are no longer storage connections for this code.
