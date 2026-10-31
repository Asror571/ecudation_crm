# UzbekCRM Backend

NestJS API package. Node.js 22 and npm are required.

## Local development

From the repository root, copy `.env.example` to `.env`, replace every sample
credential, and ensure the `MONGO_URI` password matches `MONGO_ROOT_PASSWORD`.
Start MongoDB and Redis with `docker compose up -d mongodb redis`, then run:

```bash
cd backend
npm ci
npm run start:local
```

The backend reads the root `.env` and listens on `PORT` (default `3001` in the
example). Keep `directConnection=true` in the host-side `MONGO_URI`; otherwise
MongoDB redirects the host process to its Docker-only replica-set hostname.

After MongoDB and Redis are running, create or reset the local demo login with:

```bash
npm run seed:demo
npm run start:local
```

Open the frontend at the URL configured by `FRONTEND_PORT` in the root `.env`
(default `http://localhost:5173`) and sign in with the demo account below.
`start:local` and `seed:demo` ignore an inherited `MONGO_URI`, so the host
process uses the MongoDB URI from the root `.env`.

- Email: `local-demo-admin@education-crm.local`
- Password: `DemoCrm2026!`

The seed command is restricted to `NODE_ENV=development`. It creates a separate
demo workspace and may be rerun to reset only this demo account's password. To
use different local credentials, set `DEMO_ADMIN_EMAIL` and
`DEMO_ADMIN_PASSWORD` in the root `.env` before running the seed command.

## Checks

```bash
npm run build
npm run lint -- --no-fix
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

The API is currently an M0 foundation: health/info endpoints and the existing
authentication/workspace groundwork. Product modules are implemented milestone
by milestone from [the product contract](../docs/TZ.md).
