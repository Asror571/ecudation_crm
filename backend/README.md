# UzbekCRM Backend

NestJS API package. Node.js 22 and npm are required.

## Local development

From the repository root, copy `.env.example` to `.env`, replace every sample
credential, and ensure the `MONGO_URI` password matches `MONGO_ROOT_PASSWORD`.
Start MongoDB and Redis with `docker compose up -d mongodb redis`, then run:

```bash
cd backend
npm ci
npm run start:dev
```

The backend reads the root `.env` and listens on `PORT` (default `3001` in the
example). The local MongoDB URI uses `directConnection=true`; the replica set
advertises its Docker DNS name, which is not resolvable by a host process.

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
