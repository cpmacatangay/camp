# TRAILBLAZE — Camp Registration System

A role-based camp registration system with a public registration form, an admin web dashboard, live attendance tracking via QR code scanning, and a native Android scanner companion app.

---

## Architecture

Plain MERN monorepo with three packages:

| Package | Stack | Entry |
|---|---|---|
| `server/` | Express 5 + Mongoose + Socket.io | `src/index.js` |
| `web/` | React 19 + Vite 8 + Tailwind v4 | `src/main.jsx` |
| `android/` | Kotlin + Jetpack Compose | `MainActivity.kt` |

**Deployment:** Frontend on Vercel (SPA), Backend on Render (Node.js Web Service), Database on MongoDB Atlas.

---

## Features

- **Public registration form** — Participants register with name, contact info, parents/guardian details, and optional payment screenshot upload
- **QR code generation** — Each participant gets a unique QR token at registration (image download + inline display)
- **Admin dashboard** — Full CRUD for participants, search/filter/paginate, bulk delete, toggle attendance
- **Live attendance tracking** — Real-time updates via Socket.io; progress bar showing present vs total count
- **QR check-in (staff)** — Android app scans participant QR codes, marks them Present, dashboard updates live
- **Payment screenshot upload** — JPEG/PNG/WebP with magic-byte validation, served behind admin auth
- **Excel export** — Download full participant list as `.xlsx` via exceljs
- **Rate limiting** — Login (5/15min), scan (30/min), export (5/min), registration (50/15min)
- **Security** — CSP headers, Helmet, bcrypt cost 12, JWT with HS256, Zod input validation, magic-byte upload verification, NoSQL injection prevention
- **Password change flow** — First-time admin login forces password change

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (Atlas recommended) or `MONGO_URI=memory` for local ephemeral DB

### 1. Server

```sh
cd server
npm install

# Create .env (see Configuration section)
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET

# Seed the admin user
npm run seed

# Start dev server (auto-restart via nodemon)
npm run dev
```

### 2. Web (frontend)

```sh
cd web
npm install

# Start Vite dev server (proxies /api to localhost:5000)
npm run dev
```

Open `http://localhost:5173` — the registration form loads. Visit `/login` to access the admin dashboard.

---

## Configuration

### Server (`server/.env`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `MONGO_URI` | Yes | — | MongoDB connection string. Set to `memory` for ephemeral in-memory DB. |
| `JWT_SECRET` | Yes | — | Min 32 chars. Generate with `openssl rand -hex 32`. |
| `NODE_ENV` | No | — | Set to `production` to prevent in-memory DB fallback. |
| `PORT` | No | `5000` | Express listen port. |
| `UPLOAD_DIR` | No | `uploads` | Directory for payment screenshot uploads. |
| `CORS_ORIGIN` | No | — | Frontend origin for CORS (e.g., `https://camp.example.com`). |
| `SEED_ADMIN_EMAIL` | No | `admin@camp.com` | Email for the seeded admin user. |
| `SEED_ADMIN_PASSWORD` | No | — | Auto-generated if not set or set to `admin123`. |

### Web (`web/`)

| Env Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | For split deployment | Backend URL (e.g., `https://api.onrender.com`). Omit for dev (uses Vite proxy). |

---

## API Endpoints

| Method | Endpoint | Auth | Rate Limit | Notes |
|---|---|---|---|---|
| POST | `/api/participants` | Public | 50/15min | `multipart/form-data`. Registers a participant. |
| GET | `/api/participants/:id/qr` | Public | — | Requires `?email=` query param. Returns QR PNG. |
| POST | `/api/auth/login` | Public | 5/15min | Returns `{ token, role, email, mustChangePassword }`. |
| POST | `/api/auth/change-password` | Admin | — | Body: `{ currentPassword, newPassword }`. |
| GET | `/api/admin/participants` | Admin | 100/15min | Paginated. Query: `?page=&limit=&search=&paymentStatus=&attendanceStatus=`. |
| POST | `/api/admin/participants` | Admin | 100/15min | Same fields as public registration. |
| PUT | `/api/admin/participants/:id` | Admin | 100/15min | Partial update. |
| DELETE | `/api/admin/participants/:id` | Admin | 100/15min | — |
| DELETE | `/api/admin/participants/bulk` | Admin | 100/15min | Body: `{ ids }`. Max 500 per request. |
| PATCH | `/api/admin/participants/:id/attendance` | Admin | 100/15min | Body: `{ attendanceStatus: "Absent" \| "Present" }`. |
| POST | `/api/scan/:qrToken` | Staff | 30/min | Marks Present, emits socket event. |
| GET | `/api/admin/export` | Admin | 5/min | Downloads `.xlsx`. |
| GET | `/api/uploads/:filename` | Admin | — | Serves uploaded screenshots. `Content-Disposition: attachment`. |
| GET | `/api/health` | Public | — | Health check → `{"status":"ok"}`. |

---

## Seed Commands

```sh
# Create admin user (email/password from .env)
cd server && npm run seed

# Seed 25 sample participants (Not Paid)
cd server && node src/scripts/seedParticipants.js
```

---

## Deployment

### Split deployment (recommended)

**Backend** on Render → Web Service pointing to `server/` directory.

**Frontend** on Vercel → project root directory set to `web/` with `VITE_API_URL` env var set to the Render URL.

See `Deployment-Guide.md` for detailed instructions.

---

## Security

- **Auth**: JWT stored in localStorage, sent via Bearer header. 401 interceptor auto-logs out. Multi-tab logout via `storage` event.
- **Password**: bcrypt with cost factor 12. Enforced minimum 10 chars for new passwords.
- **Validation**: Zod v4 on all inputs — strips unknown keys, enforces types, lengths, and formats.
- **Uploads**: MIME filter + magic-byte content verification (JPEG/PNG/WebP). Files served behind admin auth.
- **Headers**: CSP, Helmet, CORS origin allowlist.
- **Rate limiting**: Per-endpoint limits to prevent brute-force and abuse.
- **NoSQL injection**: Regex escaping on search, allowlist on query params, body limit (1mb), disabled object query parsing.

---

## Lint

```sh
cd web && npm run lint
```

Uses oxlint (not eslint).

---

## Android App

The Android app (`android/`) is a QR check-in scanner for staff built with Kotlin + Jetpack Compose. It communicates with the backend via REST (`/api/auth/login`, `/api/scan/:qrToken`).

Build:
```sh
cd android
./gradlew assembleDebug
```

---

## Project Structure

```
camp/
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # env, db
│   │   ├── controllers/     # auth, participant, admin, scan, export
│   │   ├── middleware/       # auth, errorHandler, upload, validate
│   │   ├── models/          # Admin, Participant (Mongoose)
│   │   ├── routes/          # participants, auth, admin, scan, export, uploads
│   │   ├── scripts/         # seedAdmin, seedParticipants
│   │   ├── services/        # socket, qr, excel
│   │   └── index.js         # Entry point
│   └── package.json
├── web/                     # React frontend
│   ├── src/
│   │   ├── api/             # axios client
│   │   ├── components/      # UI components (form/, Modal, etc.)
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # custom hooks
│   │   ├── pages/           # Register, Login, Dashboard, Confirmation, ChangePassword
│   │   ├── App.jsx          # Router + providers
│   │   └── main.jsx         # Entry point
│   ├── vercel.json          # Vercel deployment config
│   └── package.json
├── android/                 # Kotlin scanner app
├── AGENTS.md                # Agent instructions for opencode
├── Deployment-Guide.md      # Full deployment walkthrough
├── PRD_Camp_Registration_System.md  # Product requirements
└── README.md                # This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, Tailwind v4 |
| Backend | Express 5, Mongoose 9, Socket.io 4 |
| Auth | bcrypt 6, jsonwebtoken 9 |
| Validation | Zod 4 |
| Uploads | Multer 2 |
| Database | MongoDB (Atlas) |
| Mobile | Kotlin, Jetpack Compose, Retrofit |
| Lint | oxlint |
