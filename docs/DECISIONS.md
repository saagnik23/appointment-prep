# Architecture Decision Records (ADR) — Appointment Prep

## ADR 001: Monorepo Architecture with Dedicated Client and Server Subdirectories
- **Context:** The application requires a React frontend and an Express REST API backend talking to MongoDB.
- **Decision:** Use a monorepo structure with top-level `client/` and `server/` directories, with unified root scripts (`npm run dev`, `npm run build`, `npm test`).
- **Consequences:** Easy coordination of schema types, isolated package boundaries, and independent build/deployment artifacts.

## ADR 002: Embedded Subdocuments for Appointment Preparation Items
- **Context:** An appointment owns questions, user-reported medications, and follow-ups.
- **Decision:** Store questions, medications, and follow-ups as embedded subdocuments directly inside the `Appointment` document.
- **Consequences:**
  - Guaranteed atomicity when updating or deleting appointments (cascading deletes require no multi-document transactions or orphan cleanup).
  - High performance: Entire appointment data fetched in a single indexed read.
  - Subdocuments retain individual `_id` values, timestamps, and validation.

## ADR 003: Deterministic Checklist Transformer
- **Context:** FR-06 mandates a checklist that strictly preserves user information and never invents clinical advice or missing fields.
- **Decision:** Implement a pure function `transformToChecklist(appointmentDoc)` in backend and mirror in frontend presentation logic. It maps stored user records directly to sections and items, ensuring identical output for identical input without any side effects.
- **Consequences:** Complies fully with explicit non-goals. Zero risk of hallucinatory clinical content.

## ADR 004: Multi-Tenant Authorization via Query Filter
- **Context:** Sensitive medical and appointment preparation data must never be accessible across user accounts (FR-01).
- **Decision:** Enforce ownership at the database query level on every controller and data-access layer by always combining `_id: recordId` with `ownerId: req.user.id`.
- **Consequences:** Even if an ID is guessed or brute-forced, the database returns null, yielding a clean `404 NOT_FOUND` rather than leaking existence or data.

## ADR 005: In-Memory / Local Test Strategy
- **Context:** Fast, reliable, deterministic CI/CD and local testing of Express + Mongoose without requiring pre-seeded external database clusters.
- **Decision:** Use `mongodb-memory-server` for automated backend integration tests and Supertest for HTTP endpoint testing.
- **Consequences:** 100% test isolation, fast execution, zero external network dependency during test runs.

## ADR 006: Browser Session Hardening with HttpOnly Cookies and Double-Submit CSRF
- **Context:** Storing JWT tokens in browser `localStorage` exposes sensitive appointment and medication logs to theft via Cross-Site Scripting (XSS).
- **Decision:** Store session tokens exclusively in `HttpOnly`, `Secure` (in production), `SameSite=Lax` cookies named `appointment_prep_session`. Implement the double-submit CSRF cookie pattern with an `XSRF-TOKEN` cookie validated against an `X-XSRF-TOKEN` header on all mutating requests (`POST`, `PATCH`, `DELETE`). Provide an explicit `POST /api/v1/auth/logout` endpoint that revokes the session.
- **Consequences:** Tokens cannot be extracted by client-side scripts. CSRF attacks are prevented because rogue origins cannot read the CSRF cookie to forge the matching header.

## ADR 007: Strict Explicit CORS Allowlist
- **Context:** A permissive CORS callback allows arbitrary origins to make credentialed requests to read patient data.
- **Decision:** Implement an explicit allowlist in `server/src/app.js` parsing `CORS_ORIGIN`. Unspecified origins are rejected with a 403 error. Requests with no Origin header (health checks, CLI, curl) are permitted without CORS headers.
- **Consequences:** Unauthorized websites cannot read or interact with the API, even if a user is logged in.

## ADR 008: Production Secret Validation & Information Leakage Masking
- **Context:** Weak or placeholder secrets compromise cryptographic authentication, and detailed 5xx errors leak system internals.
- **Decision:** Fail fast on server startup if `NODE_ENV === 'production'` and `JWT_SECRET` is missing, short (<32 chars), or matches default placeholders. In production error handling, replace all 5xx messages with generic safe text, suppressing stack traces and query details.
- **Consequences:** Prevents misconfigured deployments from starting in production and eliminates backend information disclosure.

## ADR 009: Calm Forest Green UI/UX Design System and Absolute Ban on Purple / Violet / Indigo
- **Context:** Medical preparation software requires a tranquil, trustworthy aesthetic to reduce patient anxiety. Previous ad-hoc styling introduced purple and high-saturation colors into medication views and checklist titles.
- **Decision:** Standardize the frontend on an organic forest green palette (`#2F6B50` primary, `#E8F1EA` soft accents, `#F7F8F5` background, `#1D2922` text, `#E2E8E2` borders). Strictly prohibit purple, violet, or indigo across all components, badges, actions, and errors. Enforce WCAG 2.2 AA contrast ratios and visible `focus-visible` styling (`outline: 2px solid #2F6B50`).
- **Consequences:** Cohesive, anxiety-reducing visual experience across all 8 product views. High contrast, accessible focus management, and predictable visual hierarchy.

## ADR 010: Health/Readiness Probes and Bounded Idempotent Graceful Shutdown
- **Context:** Containerized production deployments (Kubernetes, ECS, Docker) require separate liveness and database-aware readiness checks, and must shut down without dropping in-flight requests.
- **Decision:** Provide `/health` (process liveness) and `/ready` (MongoDB connection check via `isDBConnected()`). Implement bounded graceful shutdown in `server/src/index.js` handling `SIGTERM` and `SIGINT` with a 10-second timeout, ensuring database connections are closed cleanly.
- **Consequences:** Eliminates premature traffic routing during cold starts and ensures orderly termination without hung processes or dropped connections.
