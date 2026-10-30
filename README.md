# Education CRM

## Loyiha haqida

**Education CRM** — o'quv markazlari uchun mo'ljallangan, kelajakda ko'p tenantli (multi-tenant) SaaS CRM platformasi. Platforma keyinchalik o'quv markazlariga talabalar, o'qituvchilar, kurslar, guruhlar, davomat va to'lovlarni boshqarishda yordam beradi.

Loyihada **M0 texnik poydevori** bilan birga dastlabki autentifikatsiya va workspace modullari mavjud. Backend login, token yangilash, logout va joriy foydalanuvchini olish endpointlarini taqdim etadi; to'liq CRM CRUD modullari hali ishlab chiqilmoqda.

## Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Backend | NestJS 11, TypeScript (strict), Node.js 22, Mongoose, `@nestjs/config`, Joi |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), i18next, oxlint |
| Ma'lumotlar bazasi | MongoDB 7 (autentifikatsiya yoqilgan) |
| Kesh infratuzilmasi | Redis 7 Alpine (parol bilan, AOF persistence) |
| Infratuzilma | Docker, Docker Compose, Nginx (production frontend and `/api` reverse proxy) |
| Paket menejeri | npm (lockfile'lar repoda saqlanadi) |

> Redis M0 bosqichida faqat infratuzilma sifatida ishga tushiriladi. Backend hozircha Redis'ga ulanmaydi, shuning uchun frontend Redis holatini ko'rsatmaydi.

## Loyiha tuzilmasi

```text
education-crm/
├── backend/
│   ├── src/                            # auth, users, workspaces, health
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/                            # React application
│   ├── nginx.conf                      # Static serving and backend reverse proxy
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── docs/
├── .github/workflows/ci.yml
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

So'ng `.env` faylidagi barcha namunaviy parol va kalitlarni **albatta**
almashtiring:

- `MONGO_ROOT_PASSWORD` va `REDIS_PASSWORD` uchun kuchli, noyob parollar
  belgilang.
- `JWT_SECRET` va `JWT_REFRESH_SECRET` uchun alohida, tasodifiy va kamida
  32 belgili kalitlar belgilang.
- Docker Compose `MONGO_URI` ni MongoDB o'zgaruvchilaridan tuzadi. Host'da
  ishlatganda `MONGO_URI` dagi credentiallar `MONGO_ROOT_PASSWORD` bilan mos
  bo'lishi kerak.

Kuchli tasodifiy parol yaratish uchun:

```bash
openssl rand -hex 24
```

Muhim eslatmalar:

- `.env` hech qachon Git'ga qo'shilmaydi (`.gitignore` da). Faqat `.env.example` commit qilinadi.
- Production'da `NODE_ENV=production` va `FRONTEND_URL` ni brauzer ishlatadigan
  aniq origin'ga (masalan, `https://crm.example.com`) o'rnating. TLS'ni tashqi
  load balancer yoki edge reverse proxy'da yakunlang; production cookie'lari
  `Secure` bo'ladi.
- `FRONTEND_BIND_ADDRESS=127.0.0.1` frontend'ni faqat shu mashinada ochadi.
  Alohida proxy host/container'dan ulanish kerak bo'lsa, `0.0.0.0` ni faqat
  firewall bilan cheklangan tarmoqda qo'llang.
- `MONGO_URI` ichidagi login/parolda URL uchun maxsus belgilar (`@ : / ? # [ ] %` va h.k.) bo'lsa, ular **percent-encode** qilinishi shart (masalan, `@` → `%40`).
- Docker Compose `MONGO_URI` ni `MONGO_ROOT_USERNAME`/`MONGO_ROOT_PASSWORD` dan avtomatik yig'adi va `mongodb` ichki hostini ishlatadi. Shuning uchun parollarda faqat URL-xavfsiz belgilardan (`A-Z a-z 0-9 - _ .`) foydalanish tavsiya etiladi. `$` belgisidan foydalanmang — Docker Compose uni o'zgaruvchi sifatida talqin qiladi.
- `.env` dagi `MONGO_URI` (`localhost:27017`) backend'ni Docker'siz, to'g'ridan-to'g'ri host'da ishga tushirish uchun ishlatiladi.
- Frontend API so'rovlarini standart holatda `/api` orqali yuboradi. Compose'da
  Nginx shu yo'lni backend'ga proxy qiladi; host development'da Vite proxy
  ishlatiladi.
- Interfeys rus tilidagi brauzer sozlamasida ruscha, boshqa holatlarda o'zbekcha
  ko'rsatiladi; tasdiqlangan dizayn/spec kelmagani uchun til tanlagich qo'shilmadi.

## Loyihani ishga tushirish

```bash
docker compose up -d --build
```

To'rtta servis ishga tushadi: `mongodb`, `redis`, `backend`, `frontend`.
Frontend production build Nginx orqali beriladi, Nginx `/api` so'rovlarini
backend'ga uzatadi. Holatini tekshirish:

```bash
docker compose ps
```

Standart host portlari band bo'lsa, `.env` da `MONGO_PORT`, `REDIS_PORT`, `BACKEND_PORT` va `FRONTEND_PORT` qiymatlarini o'zgartirish mumkin. Standart qiymatlar mos ravishda `27017`, `6379`, `3000` va `5173`.

Backend MongoDB va Redis health check'laridan keyin, frontend esa backend
health check'idan keyin ishga tushadi.

### Production ishga tushirish

1. `.env.example` dan `.env` yarating va barcha namunaviy kalitlarni almashtiring.
2. `NODE_ENV=production` va `FRONTEND_URL` ni haqiqiy HTTPS origin'ga sozlang.
3. Shu host'dagi TLS terminator uchun frontend'ni `127.0.0.1` da qoldiring.
   Alohida proxy host ishlatilsa, `FRONTEND_BIND_ADDRESS=0.0.0.0` ni faqat
   firewall bilan cheklangan tarmoqda qo'llang.
4. `docker compose up -d --build` bilan ishga tushiring va
   `docker compose ps` da to'rtta servis holatini tekshiring.
5. TLS terminator public HTTPS trafikni host'dagi `FRONTEND_PORT` ga uzatsin.
   API, MongoDB va Redis portlarini internetga bevosita ochmang.

Ilovada hozircha user yaratish yoki demo seed endpointi yo'q. CRM ma'lumotlari
va operator/sales-head rollari uchun tasdiqlangan `docs/TZ.md` hamda
`DECISIONS.md` checkout'da mavjud emas; production login va feature rollout'dan
oldin ushbu manbalar va xavfsiz user provisioning jarayoni talab qilinadi.

### Host'da ishlab chiqish (ixtiyoriy)

MongoDB va Redis'ni Docker'da qoldirib, ilovalarni host'da ishga tushirish mumkin:

```bash
docker compose stop backend frontend
docker compose up -d mongodb redis

cd backend
npm install
npm start                # root .env faylini avtomatik o'qiydi; standart host porti 3001

cd ../frontend
npm install
npm run dev              # /api so'rovlari http://localhost:3001 ga proxy qilinadi
```

Host'da ishlatishdan oldin `.env` dagi `MONGO_URI` host'dan ko'rinadigan MongoDB portiga mos bo'lishi kerak. Portni `docker compose port mongodb 27017` bilan tekshiring; URI'da shu port va `authSource=admin` ishlating. Docker Compose'dagi `FRONTEND_PORT=5173` band bo'lsa, shu loyihaning `frontend` servisini to'xtating yoki Docker portini o'zgartiring. Docker va host frontend'i bir paytning o'zida bir portni ishlata olmaydi.

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
cd backend
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

`port is already allocated` xatosi kerakli host portini boshqa jarayon band qilganini bildiradi. Band qilgan jarayonni toping (`lsof -i :5173` yoki `ss -ltnp`) va faqat o'zingizga tegishli bo'lsa to'xtating; aks holda loyiha portini `.env` dagi `FRONTEND_PORT`, `BACKEND_PORT`, `MONGO_PORT` yoki `REDIS_PORT` orqali o'zgartiring. Host'dagi backend standartda 3001 portidan foydalanadi; Compose backend'i ichki 3000 portida ishlaydi.

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

- `curl http://localhost:3001/api/health` — host'da ishlayotgan backend javob berayotganini tekshiring.
- `curl http://localhost:5173/api/health` — Docker'da Nginx reverse proxy'ni tekshiring.
- Frontend standartda nisbiy `/api` manzilidan foydalanadi; Docker Nginx `backend:3000` ga, host development'dagi Vite esa `http://localhost:3001` ga yo'naltiradi.
- `docker compose logs frontend` dagi `proxy error` xabarlariga qarang.

### Docker build xatolari

- `backend/package-lock.json` va `frontend/package-lock.json` mavjud hamda `package.json` bilan mos ekanini tekshiring (`npm ci` lockfile talab qiladi).
- Keshsiz qayta build: `docker compose build --no-cache`.
- Docker Hub `429 Too Many Requests` xatosi — biroz kuting yoki `docker login` qiling.

### npm dependency xatolari

- Node.js versiyasi 22 ekanini tekshiring: `node -v`.
- `node_modules` ni o'chirib, qayta o'rnating: `rm -rf node_modules && npm ci`.
- Lockfile'ni qo'lda tahrirlamang; yangi paket qo'shish uchun `npm install <paket>` dan foydalaning.
