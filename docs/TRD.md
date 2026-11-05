# Technical Requirements Document (TRD) — Appointment Prep

## 1. Technical Stack

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Fast, responsive single-page application |
| **Styling & Icons** | Tailwind CSS / Lucide Icons | Clean aesthetic with accessible focus rings and print stylesheet |
| **Backend** | Node.js (v25+) & Express 4 | Modular REST API adhering to `/api/v1` specification |
| **Database** | MongoDB (v8+) via Mongoose 8 | Embedded subdocument model with compound indexing |
| **Validation** | Express-Validator | Strict input sanitization and validation on all routes and queries |
| **Session & Auth** | JWT inside `HttpOnly` Cookie & CSRF Protection | Private multi-tenant access control resilient to XSS and CSRF |
| **Testing** | Jest, Supertest, Vitest, Testing Library | 100% automated test coverage across API, security, UI, and E2E |

## 2. High-Level Architecture

```text
                  REACT CLIENT (Vite + TS)
                              |
                     HTTPS / JSON REST
           (HttpOnly Session Cookie + X-XSRF-TOKEN Header)
                              |
                              v
                  EXPRESS REST API (/api/v1)
        ---------------------------------------------
        |           |             |                 |
     Security      CSRF         Auth & Rate     Validation
    (Helmet/CORS) (Middleware)  (Cookie/JWT)    (Middleware)
        |           |             |                 |
        ---------------------------------------------
                              |
                              v
                        CONTROLLERS
                   (HTTP response handling)
                              |
                              v
                       SERVICES LAYER
                 (Business rules & mapping)
                              |
                              v
                       MONGOOSE MODELS
                              |
                              v
                           MongoDB
              [Users]   [Appointments + Embedded Subdocs]
```

## 3. Security, Session & Networking Architecture

### 3.1 Authentication & Session Management
- **Session Transport:** Authentication uses an `HttpOnly`, `Secure` (in production), `SameSite=Lax` cookie named `appointment_prep_session`.
- **Token Protection:** The raw JWT is never returned in JSON payloads or stored in browser `localStorage`, eliminating token theft via XSS.
- **CSRF Defense (Double-Submit Pattern):** The backend issues a readable cookie `XSRF-TOKEN` upon authentication. The client attaches this token to the `X-XSRF-TOKEN` header on all mutating requests (`POST`, `PATCH`, `DELETE`). The `verifyCsrf` middleware validates header and cookie parity before permitting state changes.
- **Revocation:** A dedicated `POST /api/v1/auth/logout` endpoint clears both session and CSRF cookies.

### 3.2 CORS Policy
- Explicit allowlist parsing `CORS_ORIGIN` (defaults to `http://localhost:5173` with dev allowlist for localhost ports).
- Non-origin requests (CLI, curl, health checks) are permitted without CORS headers.
- Disallowed origins are rejected with a `403 FORBIDDEN` error. `origin: '*'` is never used with `credentials: true`.

### 3.3 Rate Limiting
- **General API Limiter:** Applied to all `/api/` endpoints (default: 200 requests / 15 minutes).
- **Authentication Limiter:** Applied strictly to `/api/v1/auth/login` and `/api/v1/auth/register` (default: 10 requests / 15 minutes, configurable via `AUTH_RATE_LIMIT_MAX` and `AUTH_RATE_LIMIT_WINDOW_MS`). Bypassed in `NODE_ENV === 'test'`.

### 3.4 Monitoring & Probes
- **Liveness (`GET /health`):** Verifies the Node process is running and responding to HTTP traffic.
- **Readiness (`GET /ready`):** Verifies active database connectivity (`mongoose.connection.readyState === 1`). Returns `200` when connected and `503` when disconnected.

---

## 4. Database Schema Specification

### User Schema (`User`)
- `_id`: ObjectId
- `name`: String, required, trimmed, max 100
- `email`: String, required, lowercase, unique index
- `passwordHash`: String, required (bcrypt hash, 10 rounds)
- `createdAt`, `updatedAt`: Timestamps

### Appointment Schema (`Appointment`)
- `_id`: ObjectId
- `ownerId`: ObjectId (ref: User, index)
- `title`: String, required, max 200 chars
- `providerName`: String, optional, max 150 chars
- `scheduledAt`: Date, optional
- `location`: String, optional, max 250 chars
- `notes`: String, optional, max 2000 chars
- `status`: Enum (`upcoming`, `completed`, `cancelled`), default `upcoming`
- `questions`: Embedded subdocuments (`_id`, `text`, `status`, `order`, timestamps)
- `medications`: Embedded subdocuments (`_id`, `name`, `dose`, `frequency`, `notes`, `order`, timestamps)
- `followUps`: Embedded subdocuments (`_id`, `text`, `dueAt`, `status`, timestamps)
- `createdAt`, `updatedAt`: Timestamps

Compound Indexes:
- `{ ownerId: 1, scheduledAt: -1 }`
- `{ ownerId: 1, status: 1 }`
