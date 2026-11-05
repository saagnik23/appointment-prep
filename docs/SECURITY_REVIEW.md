# Security Review & Threat Model — Appointment Prep

**Review Date:** November 5, 2026  
**Reviewer:** Principal Software & Application Security Engineer  
**Scope:** Full-stack codebase (`client/`, `server/`, environment configuration, deployment boundaries)  
**Classification:** Confidential  

---

## 1. Executive Summary

An independent security review of the Appointment Prep repository was performed. The application handles highly sensitive personal data: healthcare appointment details, patient questions, self-reported medications (dosages, frequencies, schedules), and clinical follow-up actions. 

While the fundamental data model correctly enforces owner-scoped queries (`ownerId: req.user.id`) and atomic cascaded subdocument deletion, critical and high-severity security vulnerabilities were identified in CORS policy, secret management, error message leakage, browser token persistence, authentication throttling, and lifecycle readiness.

---

## 2. Threat Model & Request Lifecycle

```text
[ Attacker / Malicious Site ]           [ Legitimate Patient Browser ]
            |                                         |
            | CSRF / Origin Spoofing                  | HTTPS Request
            v                                         v
+-----------------------------------------------------------------------+
| Express Application (server/src/app.js)                              |
|                                                                       |
| 1. Helmet Security Headers (HSTS, NoSniff, XSS Protection)            |
| 2. Strict CORS Filter (Allowed Origins allowlist, rejection of rogue) |
| 3. Rate Limiters (General API Limiter & Dedicated Strict Auth Limiter)|
| 4. Cookie & Body Parsers (1 MB size cap, cookie-parser)              |
| 5. CSRF Validation Middleware (Double-submit XSRF token for mutations)|
| 6. Authentication Middleware (HttpOnly session cookie / Bearer auth)  |
| 7. Request Input Validation (Schema-based sanitization & checks)      |
| 8. Controller & Service Layer (ownerId isolation enforced)           |
| 9. Centralized Error Handler (Masking 5xx in prod, mapping Mongoose)  |
+-----------------------------------------------------------------------+
                                  |
                                  v
                      +-----------------------+
                      | MongoDB (Appointments)|
                      | - Indexed by ownerId  |
                      | - Atomic subdocuments |
                      +-----------------------+
```

### Assets at Risk
1. **Patient Data Confidentiality:** Self-reported medications, clinical questions, appointment times, provider names, and preparation notes.
2. **Account Integrity:** User passwords and active authentication sessions.
3. **Availability:** Resilience against credential stuffing, brute force, and memory exhaustion.

---

## 3. Findings Ranked by Severity

### Finding 1: Permissive CORS Configuration Allows Unauthorized Cross-Origin Credentialed Requests
- **Severity:** Critical (P0)
- **Location:** `server/src/app.js` (Lines 22–32)
- **Vulnerability:** The CORS `origin` callback currently ends with `return callback(null, true);` even when an origin fails to match `env.CORS_ORIGIN`. Combined with `credentials: true`, any malicious web origin can send authenticated cross-origin requests and read sensitive patient records.
- **Remediation:** Enforce a strict allowlist. Allow requests with no Origin header (health checks, CLI, curl, same-origin). In development, allow explicitly configured origins (`http://localhost:5173`, `http://localhost:3000`). Reject all other origins with a CORS error. Never use `origin: '*'` with credentials.
- **Residual Risk:** Low after implementing the strict origin check.

### Finding 2: Predictable JWT Secret Fallback in Configuration
- **Severity:** Critical (P0)
- **Location:** `server/src/config/env.js` (Line 11)
- **Vulnerability:** The configuration defaults to `'dev_insecure_jwt_secret_key_appointment_prep_2026'`. In production, if `JWT_SECRET` is omitted or left as a known placeholder, an attacker can forge arbitrary JWTs and impersonate any patient.
- **Remediation:** In `env.js`, fail fast with a fatal startup error if `NODE_ENV === 'production'` and `JWT_SECRET` is missing, less than 32 characters, or matches default/placeholder strings. Update `.env.example` with instructions for generating a cryptographically random secret.
- **Residual Risk:** Negligible.

### Finding 3: Internal Server Error Details Leaked to Clients in Production
- **Severity:** High (P0)
- **Location:** `server/src/middleware/errorHandler.js`
- **Vulnerability:** Unhandled 5xx errors return `err.message` directly in production responses. This can leak database schemas, connection strings, system paths, or query fragments.
- **Remediation:** In production, replace 5xx error messages with a safe generic message: `"An unexpected error occurred. Please try again later."`. Ensure `res.headersSent` is handled safely. Map known Mongoose errors (`ValidationError`, `CastError`, `MongoServerError: 11000`) into clean 400/409 user-safe responses.
- **Residual Risk:** Negligible.

### Finding 4: Insecure Token Persistence in Browser `localStorage`
- **Severity:** High (P1)
- **Location:** `client/src/services/api.ts`, `client/src/context/AuthContext.tsx`, `server/src/modules/auth/`
- **Vulnerability:** Tokens stored in `localStorage` are vulnerable to exfiltration via cross-site scripting (XSS).
- **Remediation:** Migrate session management to an `HttpOnly`, `Secure` (in prod), `SameSite=Lax` cookie. Add `POST /api/v1/auth/logout` endpoint that clears the session cookie. Implement double-submit CSRF cookie protection (`XSRF-TOKEN` cookie validated against `X-XSRF-TOKEN` header on state-changing requests). Maintain Bearer token fallback in middleware for automated tests and non-browser clients.
- **Residual Risk:** Low.

### Finding 5: Missing Dedicated Rate Limiting on Authentication Endpoints
- **Severity:** High (P1)
- **Location:** `server/src/modules/auth/auth.routes.js`, `server/src/app.js`
- **Vulnerability:** Only a broad rate limiter exists on `/api/` (200 requests/15m). An attacker can perform automated credential stuffing or dictionary attacks against `/api/v1/auth/login` and account exhaustion against `/api/v1/auth/register`.
- **Remediation:** Add route-specific strict rate limiting on `/login` and `/register` (configurable via `AUTH_RATE_LIMIT_MAX` and `AUTH_RATE_LIMIT_WINDOW_MS`, bypassed in `test` environment to prevent test flakiness).
- **Residual Risk:** Low.

### Finding 6: Incomplete Graceful Shutdown and Missing Readiness Probe
- **Severity:** Medium (P1)
- **Location:** `server/src/index.js`, `server/src/app.js`, `server/src/config/db.js`
- **Vulnerability:** Server termination lacks idempotent signal handling and active connection draining before Mongoose disconnect. Furthermore, only `/health` exists (liveness) with no `/ready` probe checking actual MongoDB connectivity.
- **Remediation:** Add separate `/ready` endpoint that checks `mongoose.connection.readyState === 1`. Make shutdown handler idempotent for SIGTERM/SIGINT with bounded shutdown timeout.
- **Residual Risk:** Negligible.

### Finding 7: Unvalidated Query Parameters on Appointments Listing
- **Severity:** Medium (P2)
- **Location:** `server/src/modules/appointments/appointments.routes.js`
- **Vulnerability:** `GET /api/v1/appointments` silently ignored unsupported `status` query parameters and did not validate `search` string length.
- **Remediation:** Add query parameter validation using express-validator for `status` (`upcoming`, `completed`, `cancelled`) and `search` (max 100 characters).
- **Residual Risk:** Negligible.

### Finding 8: Root Build Script Executes `npm install` on Every Invocation
- **Severity:** Low (P2)
- **Location:** `package.json`
- **Vulnerability:** Running `npm run build` runs `npm install` in server and client, slowing down builds and risking non-deterministic package resolution.
- **Remediation:** Separate build step (`npm --prefix client run build`) from dependency installation (`npm ci`).
- **Residual Risk:** Negligible.

---

## 4. Verification & Testing Matrix

Each remediation will be accompanied by automated regression tests in the backend and frontend suites:
- `server/tests/cors.test.js`: Validates allowed origins, disallowed origins (403/rejection), and missing origins.
- `server/tests/env.test.js`: Validates production fail-fast on weak/missing JWT secrets.
- `server/tests/errorHandler.test.js`: Validates production 5xx masking and Mongoose error translation.
- `server/tests/auth_cookies.test.js`: Validates HttpOnly cookie setting, clearing on logout, and CSRF token verification.
- `server/tests/rate_limit.test.js`: Validates auth-specific rate limiting.
- `server/tests/readiness.test.js`: Validates `/health` vs `/ready` under connected and disconnected DB states.
- `server/tests/appointments_query.test.js`: Validates rejection of invalid query parameters.

