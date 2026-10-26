# Rashedul Islam portfolio

React, TypeScript, Vite, and Tailwind serve the portfolio. The Node/Express API serves content, admin editing, and the contact form. The original design presets and interactive turbine lab remain available.

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a random `JWT_SECRET` of at least 32 characters. Keep `.env` private.
3. Run `npm run dev` and open `http://localhost:3000`.

Without server-side Firebase credentials, development reads public Firestore portfolio documents and stores edits and contact messages in the ignored `data/portfolio.local.json` file. A local file takes precedence on restart. To test the production storage path locally, configure `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` instead. Do not place a service account in source files or any `VITE_` variable.

`npm run lint` checks types; `npm run build` builds the browser and server. `npm run build:netlify` and `npm run build:vercel` create the deployment bundles.

## Deploy securely

1. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a unique `JWT_SECRET` (at least 32 characters) in your hosting provider's private environment variables.
2. Give the server a service account for the Firebase project in `firebase-applet-config.json`. Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the complete one-line service-account JSON, or configure application default credentials and set `FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS=true`. The service account must be authorized to read and write the named Firestore database.
3. Deploy the application with these variables, then apply `firestore.rules` to the named Firestore database. The rules allow visitors to read public portfolio documents while denying direct client writes and reads of contact messages. Admin SDK calls bypass Firestore client rules.
4. Confirm that `/api/health` responds, public content loads, and an admin edit persists after a cold restart. A missing server credential causes writes to return HTTP 503 instead of reporting a false success.

The saved rules file does **not** change the live Firebase rules until you deploy it. Apply it promptly after configuring the server credential. Restrict or rotate any previously exposed credentials through your hosting provider as needed.

The bundled `data/portfolio_db.json` is only a display fallback for unauthenticated public reads. With server credentials configured, a failed or slow initial Firestore read stops startup rather than accepting edits against stale data.

Large dependencies load as needed: the PDF generator loads when a CV is requested, and the engineering lab loads as the visitor approaches it. The hero 3D model is split into its own browser chunk.

## Saved data and citation updates

The local development server currently saves edits in `data/portfolio.local.json` unless server-side Firebase credentials are configured. With credentials, it uses the Firestore project and named database in `firebase-applet-config.json`, under `portfolio/{section}` (for example `portfolio/profile` and `portfolio/publications`). `data/portfolio_db.json` is a bundled display fallback, not the live database. `/api/health` identifies the storage mode without exposing credentials.

Every API request refreshes its snapshot from the configured storage. Firestore saves write changed sections only, so an unrelated edit cannot overwrite other sections from a stale server instance. Concurrent edits to the same section still use last-write-wins semantics.

Every page load requests saved portfolio data without browser caching. Open tabs refresh when focused, every 30 seconds while visible, and when another tab on the same origin saves an admin change. After the page load event, the browser requests a background Scholar synchronization. The server uses only the saved owner's Scholar profile, matches paper titles, and saves paper citations and the derived total/h-index together before returning success. All components and JSON exports use these saved paper counts; component-specific live overrides have been removed.

Scholar results are shared within a server instance for five minutes. Unreachable profiles back off for 30 minutes and retain saved counts; missing or unmatched papers are never reset. This is periodic synchronization, not a continuous Scholar connection. The summary represents papers in this portfolio, which can differ from a Scholar profile containing additional papers.
