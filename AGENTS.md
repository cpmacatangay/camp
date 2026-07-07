# Camp Registration System — AGENTS.md

## Repo structure

Plain MERN monorepo, two packages, no monorepo tool:

- `server/` — CommonJS Express 5 backend (entry: `src/index.js`)
- `web/` — ES module React 19 + Vite 8 frontend (entry: `src/main.jsx`)
- `android/` — Kotlin/Jetpack Compose Android app. Entry: `MainActivity.kt`. Package: `com.example.qrs`. Staff QR check-in scanner.

## Dev commands

```sh
# Server (auto-restart via nodemon)
cd server && npm run dev

# Web (Vite dev server, proxied to :5000)
cd web   && npm run dev

# Build web
cd web   && npm run build

# Lint (oxlint, not eslint — don't use eslint)
cd web   && npm run lint

# Seed admin user
cd server && npm run seed

# Seed 25 sample participants (Not Paid)
cd server && node src/scripts/seedParticipants.js

# Android (Kotlin/Compose)
cd android && ./gradlew assembleDebug
cd android && ./gradlew installDebug
cd android && ./gradlew lint
```

**No tests exist anywhere.** No typecheck command. No TypeScript.

## Framework quirks

- **Tailwind v4**: uses `@import "tailwindcss"` + `@tailwindcss/vite` plugin. No `tailwind.config.js`. No `@tailwind` directives.
- **Express 5**: error handler middleware requires all 4 params `(err, req, res, _next)`.
- **Zod v4**: `.parse()` strips unknown keys by default (unlike v3). Validation is at the route level via `validate()` middleware.
- **Multer v2**: API is same as v1 (`upload.single()`, `diskStorage`).
- **React Router v7**: `useNavigate()` must be called inside a component wrapped by `<BrowserRouter>`. Auth's `logout` uses `useNavigate`, so `<AuthProvider>` must be inside `<BrowserRouter>`.
- **Android QRS app**: Debug BuildConfig `SERVER_BASE_URL = http://10.0.2.2:5000` (emulator → host loopback). For physical devices, override in-app via Settings screen. Server URL is persisted in DataStore.

## Auth architecture

- `AuthContext` (`context/AuthContext.jsx`) provides `user`, `login(email, password)`, `logout()`.
- Token stored in localStorage key `camp_user`, also set on axios default header via `setAuthToken()`.
- `<AuthProvider>` wraps app inside `<BrowserRouter>` in `App.jsx`.
- `<ProtectedRoute>` redirects to `/login` when `user` is null.
- Socket.io connection in `Dashboard` reads token from `user.token` — guarded with `user?.token`.

## API routes

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/participants` | Public | Rate limited (50/15min). `multipart/form-data`. |
| `GET /api/participants/:id/qr` | Public | Returns PNG image. |
| `POST /api/auth/login` | Public | Returns `{ token, role, email }`. |
| `GET /api/admin/participants` | Admin | Paginated: `?page=1&limit=10&search=&paymentStatus=&attendanceStatus=`. Returns `{ participants, total, page, totalPages }`. |
| `POST /api/admin/participants` | Admin | Same fields as public registration. |
| `PUT /api/admin/participants/:id` | Admin | Partial update. |
| `DELETE /api/admin/participants/:id` | Admin | |
| `PATCH /api/admin/participants/:id/attendance` | Admin | Body: `{ attendanceStatus: "Absent" | "Present" }`. |
| `POST /api/scan/:qrToken` | Staff | Marks Present, emits socket event `attendance:updated`. |
| `GET /api/admin/export` | Admin | Downloads `.xlsx` via exceljs. |

## Server env

Required `.env` in `server/`. Required vars: `MONGO_URI`, `JWT_SECRET`. Falls back to in-memory MongoDB if `MONGO_URI=memory`. `UPLOAD_DIR` defaults to `uploads`.

## Uploads

Multer saves to `UPLOAD_DIR/` (default `server/uploads/`). Express serves statically at `/uploads`. Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`. Max 5MB.

## Frontend state management

- **Auth**: context-based (`AuthContext`).
- **Toast notifications**: `ToastProvider` + `useToast()` hook from `components/Toast.jsx`. Methods: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`. Auto-dismiss 4s.
- **Form state**: local `useState` per page. No global form state.
- **Socket**: Dashboard connects to `/` with auth token, listens for `attendance:updated` events to update participant list live.

## File upload order

In routes, `upload.single('paymentScreenshot')` runs **before** `validate(schema)`. If validation fails, the file is already saved to disk (orphaned). This is by design — multer must parse multipart before Zod can read `req.body`.

## Pagination

Server returns `{ participants, total, page, totalPages }`. Client stores `page`, `totalPages`, `total` as state. Filters reset page to 1 automatically.

## Known patterns

- Form field helper: `function set(field) { return (e) => setForm(...) }` — used in Register, ParticipantModal.
- Shared form components in `components/form/`: `TextField`, `TextAreaField`, `DateField`, `ParentsFieldset`, `PaymentSection`.
- `RequiredBadge` hides once field has non-empty value (`required && !value`).
- Dashboard has responsive layout: desktop table (`hidden md:block`) + mobile cards (`md:hidden`).
