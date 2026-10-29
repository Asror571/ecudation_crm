# Education CRM

## Loyiha haqida

**Education CRM** — o'quv markazlari uchun mo'ljallangan, kelajakda ko'p tenantli (multi-tenant) SaaS CRM platformasi. Platforma keyinchalik o'quv markazlariga talabalar, o'qituvchilar, kurslar, guruhlar, davomat va to'lovlarni boshqarishda yordam beradi.

Loyihada **M0 texnik poydevori** bilan birga dastlabki autentifikatsiya va workspace modullari mavjud. Backend login, token yangilash, logout va joriy foydalanuvchini olish endpointlarini taqdim etadi; to'liq CRM CRUD modullari hali ishlab chiqilmoqda.

## Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Backend | NestJS 11, TypeScript (strict), Node.js 22, Mongoose, `@nestjs/config`, Joi |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), oxlint |
| Ma'lumotlar bazasi | MongoDB 7 (autentifikatsiya yoqilgan) |
| Kesh infratuzilmasi | Redis 7 Alpine (parol bilan, AOF persistence) |
| Infratuzilma | Docker, Docker Compose |
| Paket menejeri | npm (lockfile'lar repoda saqlanadi) |

> Redis M0 bosqichida faqat infratuzilma sifatida ishga tushiriladi. Backend hozircha Redis'ga ulanmaydi, shuning uchun frontend Redis holatini ko'rsatmaydi.

## Loyiha tuzilmasi

```text
education-crm/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── env.validation.ts   # Joi orqali env validatsiyasi
│   │   │   ├── app.controller.spec.ts  # unit testlar
│   │   │   ├── app.controller.ts       # GET /api, GET /api/health
│   │   │   ├── app.module.ts           # ConfigModule + MongooseModule
│   │   │   ├── app.service.ts          # info va health logikasi
│   │   │   └── main.ts                 # bootstrap, /api prefiks, CORS
│   │   ├── test/
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── eslint.config.mjs
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   └── frontend/
│       ├── public/
│       │   └── favicon.svg
│       ├── src/
│       │   ├── App.tsx                 # tizim holati ekrani
│       │   ├── index.css               # @import "tailwindcss"
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── .oxlintrc.json
│       ├── index.html
│       ├── package.json
│       ├── package-lock.json
│       ├── tsconfig.json
│       ├── tsconfig.app.json
│       ├── tsconfig.node.json
│       └── vite.config.ts              # Tailwind plagini + /api proxy
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Talablar

- Node.js 22
- npm
- Docker
- Docker Compose (v2, `docker compose` buyrug'i)

## Muhitni sozlash

```bash
cp .env.example .env
```

So'ng `.env` faylidagi standart parollarni **albatta** almashtiring:

- `MONGO_ROOT_PASSWORD` va `MONGO_URI` ichidagi parol bir xil bo'lishi kerak.
- `REDIS_PASSWORD` — Redis paroli.

Kuchli tasodifiy parol yaratish uchun:

```bash
openssl rand -hex 24
```

Muhim eslatmalar:

- `.env` hech qachon Git'ga qo'shilmaydi (`.gitignore` da). Faqat `.env.example` commit qilinadi.
- `MONGO_URI` ichidagi login/parolda URL uchun maxsus belgilar (`@ : / ? # [ ] %` va h.k.) bo'lsa, ular **percent-encode** qilinishi shart (masalan, `@` → `%40`).
- Docker Compose `MONGO_URI` ni `MONGO_ROOT_USERNAME`/`MONGO_ROOT_PASSWORD` dan avtomatik yig'adi va `mongodb` ichki hostini ishlatadi. Shuning uchun parollarda faqat URL-xavfsiz belgilardan (`A-Z a-z 0-9 - _ .`) foydalanish tavsiya etiladi. `$` belgisidan foydalanmang — Docker Compose uni o'zgaruvchi sifatida talqin qiladi.
- `.env` dagi `MONGO_URI` (`localhost:27017`) backend'ni Docker'siz, to'g'ridan-to'g'ri host'da ishga tushirish uchun ishlatiladi.

## Loyihani ishga tushirish

```bash
docker compose up -d --build
```

To'rtta servis ishga tushadi: `mongodb`, `redis`, `backend`, `frontend`. Holatini tekshirish:

```bash
docker compose ps
```

Standart host portlari band bo'lsa, `.env` da `MONGO_PORT`, `REDIS_PORT`, `BACKEND_PORT` va `FRONTEND_PORT` qiymatlarini o'zgartirish mumkin. Standart qiymatlar mos ravishda `27017`, `6379`, `3000` va `5173`.

Backend `mongodb` va `redis` health check'lari muvaffaqiyatli bo'lgandan keyingina ishga tushadi.

### Docker'siz ishlab chiqish (ixtiyoriy)

MongoDB va Redis'ni Docker'da qoldirib, ilovalarni host'da ishga tushirish mumkin:

```bash
docker compose up -d mongodb redis

cd apps/backend
npm install
npm run start:dev        # root .env faylini avtomatik o'qiydi

cd ../frontend
npm install
npm run dev              # /api so'rovlari http://localhost:3000 ga proxy qilinadi
```

## Loyihani to'xtatish

```bash
docker compose down
```

Bu buyruq ma'lumotlarni (volume'larni) o'chirmaydi.

## Loglarni ko'rish

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## API endpointlar

| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/api` | API haqida ma'lumot |
| GET | `/api/health` | Tizim holati (MongoDB ulanishi Mongoose orqali real tekshiriladi) |
| POST | `/api/auth/login` | Email va parol orqali kirish; tokenlar `httpOnly` cookie'da saqlanadi |
| POST | `/api/auth/refresh` | Refresh cookie orqali tokenlarni yangilash |
| POST | `/api/auth/logout` | Joriy sessiyadan chiqish |
| GET | `/api/auth/me` | Joriy foydalanuvchi ma'lumotlari |

`GET /api` javobi:

```json
{ "name": "Education CRM API", "version": "0.0.1", "status": "running" }
```

`GET /api/health` javobi (HTTP 200):

```json
{
  "status": "ok",
  "services": { "api": "running", "mongodb": "connected" },
  "timestamp": "2026-10-29T17:00:00.000Z"
}
```

MongoDB ulanmagan bo'lsa, endpoint **HTTP 503** va `"status": "degraded"`, `"mongodb": "disconnected"` (yoki `connecting`) qaytaradi.

## Kirish manzillari

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api
Health:   http://localhost:3000/api/health
```

Barcha portlar faqat `127.0.0.1` ga bog'langan (tashqi tarmoqdan ochiq emas).

## Testlar va build

```bash
cd apps/backend
npm run build
npm run lint
npm test
npm run test:e2e

cd ../frontend
npm run build
npm run lint
```

## Muammolarni hal qilish

### Docker daemon ishlamayapti

`Cannot connect to the Docker daemon` xatosi chiqsa, Docker Desktop'ni (yoki Linux'da `sudo systemctl start docker`) ishga tushiring va `docker info` bilan tekshiring.

### Port band

`port is already allocated` xatosi 27017, 6379, 3000 yoki 5173 portlari boshqa jarayon tomonidan band ekanini bildiradi. Band qilgan jarayonni toping (`lsof -i :3000` yoki `ss -ltnp`) va to'xtating, yoki `docker-compose.yml` dagi host portini o'zgartiring.

### MongoDB autentifikatsiya xatosi

`Authentication failed` xatosi odatda `.env` dagi login/parol bilan bazadagi foydalanuvchi mos kelmasligidan kelib chiqadi.

**Muhim:** `MONGO_INITDB_ROOT_*` qiymatlari faqat `mongodb_data` volume'i **birinchi marta** yaratilganda qo'llaniladi. Volume mavjud bo'lgandan keyin `.env` dagi parolni o'zgartirish bazadagi foydalanuvchini avtomatik yangilamaydi. Variantlar:

1. Eski parolni `.env` ga qaytaring.
2. Parolni MongoDB ichida o'zgartiring (eski parol bilan kirib):
   ```bash
   docker compose exec mongodb mongosh -u crm_admin -p --authenticationDatabase admin \
     --eval 'db.getSiblingDB("admin").changeUserPassword("crm_admin", "YANGI_PAROL")'
   ```
3. Volume'ni o'chirib, qayta yaratish. **Ogohlantirish: bu MongoDB'dagi barcha ma'lumotlarni butunlay o'chiradi!** Faqat ishlab chiqish muhitida va ma'lumotlar kerak bo'lmasa qo'llang:
   ```bash
   docker compose down
   docker volume rm education-crm_mongodb_data
   docker compose up -d --build
   ```

### Redis autentifikatsiya xatosi

`NOAUTH Authentication required` — parolsiz ulanishga urinish. Parol bilan tekshirish:

```bash
docker compose exec redis sh -c 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping'
```

`WRONGPASS` chiqsa, `.env` dagi `REDIS_PASSWORD` ni tekshiring va `docker compose up -d redis` bilan konteynerni qayta yarating (Redis paroli har ishga tushishda `.env` dan o'qiladi).

### Backend MongoDB'ga ulana olmayapti

- `docker compose ps` — `mongodb` holati `healthy` ekanini tekshiring.
- `docker compose logs backend` — xato matnini o'qing.
- Docker ichida host `mongodb` bo'lishi kerak (`localhost` emas). Compose buni avtomatik sozlaydi.
- Parolda maxsus belgilar bo'lsa, percent-encode qiling yoki URL-xavfsiz parol ishlating.
- `authSource=admin` parametri URI'da bo'lishi kerak.

### Frontend backend'ga ulana olmayapti

- `curl http://localhost:3000/api/health` — backend javob berayotganini tekshiring.
- `curl http://localhost:5173/api/health` — Vite proxy ishlayotganini tekshiring.
- Docker'da `API_PROXY_TARGET=http://backend:3000`, host'da esa standart `http://localhost:3000` ishlatiladi.
- `docker compose logs frontend` dagi `proxy error` xabarlariga qarang.

### Docker build xatolari

- `apps/*/package-lock.json` mavjud va `package.json` bilan mos ekanini tekshiring (`npm ci` lockfile talab qiladi).
- Keshsiz qayta build: `docker compose build --no-cache`.
- Docker Hub `429 Too Many Requests` xatosi — biroz kuting yoki `docker login` qiling.

### npm dependency xatolari

- Node.js versiyasi 22 ekanini tekshiring: `node -v`.
- `node_modules` ni o'chirib, qayta o'rnating: `rm -rf node_modules && npm ci`.
- Lockfile'ni qo'lda tahrirlamang; yangi paket qo'shish uchun `npm install <paket>` dan foydalaning.
