# Architecture Decision Records (ADR) — Appointment Prep

## ADR 001: Monorepo Architecture with Dedicated Client and Server Subdirectories
- **Context:** The application requires a React frontend and an Express REST API backend talking to MongoDB.
- **Decision:** Use a clean monorepo structure with top-level `client/` and `server/` directories, with unified root scripts (`npm run dev`, `npm run build`, `npm run test`) to streamline developer experience and deployment.
- **Consequences:** Easy coordination of schema types, isolated package boundaries, and independent build/deployment artifacts.

## ADR 002: Embedded Subdocuments for Appointment Preparation Items
- **Context:** An appointment owns questions, user-reported medications, and follow-ups. Questions are bounded (typically 1–20), medications (typically 1–30), and follow-ups (typically 1–15).
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
