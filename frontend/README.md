# UzbekCRM Frontend

React, TypeScript, Vite, Tailwind CSS, and i18next frontend package. Node.js 22
and npm are required.

## Local development

Start the backend on port `3001`, then run:

```bash
cd frontend
npm ci
npm run dev
```

Vite proxies `/api` requests to `http://localhost:3001`. In Docker Compose the
production build is served by Nginx, which serves the SPA and reverse-proxies
`/api` to the backend container. Existing interface copy is Uzbek-first and
selects Russian for a Russian browser locale.

## Checks

```bash
npm run build
npm run lint
```
