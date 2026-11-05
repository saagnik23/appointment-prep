# Engineering Worklog — Appointment Prep

## Phase 0 through Phase 6 Baseline Loops (Historical Summary)
- Scaffolding, foundational models, authentication, appointment lifecycle, preparation items (questions, medications, follow-ups), checklist transformer, and responsive React frontend.

---

## Phase 7: Independent Verification & Security Hardening

### Loop 00 — Protect Current Repository State
- **Objective:** Verify root, active branch, inspect Git status, capture pre-change diff and commit hash.
- **Actions:**
  - Branch confirmed: `main`. Root: `/Users/saagnikdey/backendcia2`.
  - Latest commit: `093f6ef9feccd7e698f76368d73fea157dbed74f`.
  - Saved pre-change patch to `/Users/saagnikdey/.gemini/antigravity/brain/c7b0f515-48ef-4ca8-b0fc-5ae45fd274cd/pre_change.patch`.
- **Status:** Complete.

### Loop 01 — Reproduce Real Baseline on this Machine
- **Objective:** Clean dependency installation from lockfiles and execute baseline tests.
- **Actions:**
  - Ran `npm ci`, `npm --prefix server ci`, `npm --prefix client ci`.
  - Ran `npm test`: 33 backend tests + 5 frontend tests passed.
  - Ran `npm --prefix client run build`: completed in 875ms.
- **Status:** Baseline verified.

### Loop 02 — Security Review & Threat Model
- **Objective:** Inspect full request lifecycle and identify vulnerabilities.
- **Actions:**
  - Authored `docs/SECURITY_REVIEW.md` detailing assets at risk, threat model, and ranked findings:
    - P0: Permissive CORS callback in `server/src/app.js`.
    - P0: Predictable JWT secret fallback in `server/src/config/env.js`.
    - P0: 5xx internal error details leaked to clients in `server/src/middleware/errorHandler.js`.
    - P1: Token persisted in browser `localStorage`.
    - P1: Missing dedicated rate limiter on auth endpoints.
    - P1: Incomplete graceful shutdown and missing `/ready` probe.
    - P2: Unvalidated query parameters on `GET /api/v1/appointments`.
    - P2: Root build script installing dependencies on build.
- **Status:** Complete.

### Loop 03 — Implement Security Fixes One at a Time
- **Fix 1 (CORS):** Implemented strict allowlist in `server/src/app.js`. Added `server/tests/cors.test.js` (3/3 passed).
- **Fix 2 (JWT Secret Fail-Fast):** Implemented `validateEnv` in `server/src/config/env.js` failing fast in production on missing/placeholder/short secrets. Added `server/tests/env.test.js` (5/5 passed).
- **Fix 3 (Error Masking):** Enhanced `server/src/middleware/errorHandler.js` to mask 5xx errors in production, map Mongoose errors, and handle `headersSent`. Added `server/tests/errorHandler.test.js` (4/4 passed).
- **Fix 4 (Session Cookie & CSRF):** Installed `cookie-parser`. Created `server/src/utils/cookies.js` issuing `HttpOnly`, `SameSite=Lax` session cookie and `XSRF-TOKEN` cookie. Built `server/src/middleware/csrf.js` verifying `X-XSRF-TOKEN` header on mutations. Updated `api.ts` and `AuthContext.tsx` removing `localStorage`. Added `server/tests/auth_cookies.test.js` (6/6 passed).
- **Fix 5 (Auth Rate Limiting):** Added dedicated rate limiter on `/api/v1/auth/login` and `/api/v1/auth/register` in `auth.routes.js`. Added `server/tests/rate_limit.test.js` (1/1 passed).
- **Fix 6 (Readiness & Shutdown):** Added `GET /ready` probe checking `isDBConnected()` in `server/src/app.js` and `db.js`. Implemented bounded idempotent shutdown in `server/src/index.js`. Added `server/tests/readiness.test.js` (3/3 passed).
- **Fix 7 (Query Validation):** Added query validation on `GET /api/v1/appointments` in `appointments.routes.js`. Added `server/tests/query_validation.test.js` (3/3 passed).
- **Fix 8 (Build Script):** Decoupled build from dependency installation in root `package.json`.
- **Status:** All 8 fixes implemented with focused regression tests.

### Loop 03B — UI/UX Overhaul & Calibrated Design System Mandate
- **Objective:** Transform the visual identity to a calm, trustworthy forest-green palette (`#2F6B50`, `#E8F1EA`, `#F7F8F5`, `#1D2922`, `#E2E8E2`) and strictly eliminate all purple/violet/indigo hues.
- **Actions:**
  - Tokenized colors in `client/tailwind.config.js`: `app`, `surface`, `main-text`, `secondary-text`, `border`, `primary`, `primary-hover`, `primary-soft`, `error`, `warning`, `success`.
  - Updated `client/src/index.css`: WCAG 2.2 AA compliant focus ring (`2px solid #2F6B50`), `@media print` rules for paper and PDF export.
  - Purged 100% of `purple-*` classes in `client/src/features/medications/MedicationsSection.tsx` and `ChecklistPreviewPage.tsx`. Verified 0 occurrences of purple, violet, or indigo across the client tree.
  - Redesigned `Navbar.tsx`, `Footer.tsx`, `Modal.tsx`, `ConfirmDialog.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `AppointmentsListPage.tsx`, `AppointmentDetailPage.tsx`, `QuestionsSection.tsx`, `MedicationsSection.tsx`, `FollowUpsSection.tsx`, and `ChecklistPreviewPage.tsx`.
  - Added new Vitest test suites: `MedicationsSection.test.tsx` and `QuestionsSection.test.tsx`.
  - Created `docs/UI_UX_AUDIT.md` (screen-by-screen audit) and `docs/DESIGN_SYSTEM.md`.
- **Status:** Complete.

### Loop 04 — Full Regression & Smoke Verification
- **Objective:** Verify complete 12-point user journey and security invariants.
- **Actions:**
  - Built and executed `server/tests/smoke_full_verification.js`.
  - Verified user registration, login, session restore, appointment CRUD, question organizer, medication list, follow-ups, checklist generation, multi-tenant 404 isolation, logout cookie clearing, CORS rejection, and production error masking.
  - All 12 checks passed with 100% success.
- **Status:** Complete.

### Loop 05 — Documentation & Release Gate
- **Objective:** Synchronize all documentation, test reports, API specifications, and README.
- **Actions:**
  - Updated `README.md`, `docs/TRD.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/CODEBASE_AUDIT.md`, `docs/DECISIONS.md`, `docs/WORKLOG.md`, `docs/TEST_REPORT.md`, `docs/UI_UX_AUDIT.md`, and `docs/DESIGN_SYSTEM.md`.
  - Recounted actual test runner outputs (70 automated test cases: 59 server + 11 client).
- **Status:** Complete.

### Loop 06 — Interactive Prep Assistant / Chatbot Integration
- **Objective:** Enable an active, responsive chatbot in the dashboard support panel to reply to user inquiries, brainstorm visit questions, provide preparation advice, and maintain strict non-clinical safety boundaries.
- **Actions:**
  - Created `server/src/modules/assistant/assistant.controller.js` and `server/src/modules/assistant/assistant.routes.js` mounted at `/api/v1/assistant/chat`.
  - Built contextual responses: personalized greetings, question prompts, medication recording instructions, what-to-bring checklists, and clinical disclaimers.
  - Added `api.sendAssistantMessage` in `client/src/services/api.ts`.
  - Integrated dynamic chat conversation in `client/src/features/appointments/AppointmentsListPage.tsx` with loading indicators, auto-scroll, and interactive suggestion chips.
  - Added comprehensive backend tests in `server/tests/assistant.test.js` (6/6 passed).
  - Verified total automated test count: 76 automated test cases (65 server + 11 client).
- **Status:** Complete. Verified live on dev server and Vite proxy.

### Loop 07 — Metric Integrity, Cancelled Visit Reporting & Checklist Navigation Fixes
- **Objective:** Resolve reported defects where the "Preparation checklist" button was non-interactive and the dashboard/cancelled report displayed fabricated numeric data (falling back to 12 visits, 8 questions, 4 meds, and hardcoded 86%).
- **Actions:**
  - **Checklist Button Fix:** Converted the static `<div>` in the right-hand panel into a functional, accessible `<button>` using React Router `useNavigate`. When clicked, it automatically navigates to `/appointments/:id/checklist` for the upcoming visit, or opens the appointment creation modal if no visit has been recorded yet.
  - **Eliminated Fake Hardcoded Fallbacks:** Removed all placeholder fallback values (`: 12`, `|| 8`, `|| 4`, hardcoded `86%`).
  - **Decoupled Overview Metrics from Filter Tabs:** Dashboard metrics (total visits, upcoming, completed, cancelled, questions, medications, and preparedness rate) are now calculated from the complete user dataset, so switching to the "Cancelled" filter does not corrupt or zero-out overall account stats.
  - **Explicit Cancelled Visit Metrics:** Added dedicated "Cancelled Visits" counters to Card 2, the Card 3 status axis, and dynamic count badges to each tab (`All [N]`, `Upcoming [N]`, `Completed [N]`, `Cancelled [N]`).
  - **Direct Visit Cancellation & Restoration:** Added "Cancel Visit" and "Restore to Upcoming" options in the appointment card dropdown menu.
- **Status:** Complete. Verified via full client build and 76 automated tests.

### Loop 08 — Revert Experimental UI & Retain Approved Dashboard UI
- **Objective:** Revert experimental mockup changes upon user instruction; restore the approved dashboard UI featuring the 3 metric overview cards, right-hand activity & interactive assistant panel, and strict typography.
- **Actions:**
  - Restored `DashboardLayout.tsx` with the clean vertical sage-green sidebar and top search/date header.
  - Restored `AppointmentsListPage.tsx` with the 3 top overview cards (circular progress, upcoming/completed/cancelled counters, readiness analytics chart), status tabs, appointments list, right-panel activity card, and interactive chat assistant.
  - Reverted font configuration back to Inter across `index.html`, `tailwind.config.js`, and `index.css`.
  - Maintained all previous critical fixes: active "Preparation checklist" navigation button, decoupled overall metrics, explicit cancelled count, and live assistant chat endpoint integration.
- **Status:** Complete. Verified via production build and automated tests.

### Chatbot Conversational Response Enhancement & Non-Clinical Safety Verification

- **Objective:** Fix repetitive and robotic fallback responses (e.g., `"I've noted that."` on conversational queries like `"how are you"`).
- **Changes in `server/src/modules/assistant/assistant.controller.js`:**
  - Added dedicated pattern recognition for check-in queries (`how are you`, `how's it going`, `what's up`) with warm, personalized replies and context-aware follow-ups.
  - Added conversational support for gratitude (`thank you`, `thanks`), identity/capabilities (`who are you`, `help`), pre-visit anxiety/nervousness, upcoming appointment queries, and clinical specialties (dentistry, dermatology, optometry, cardiology, mental health, pediatrics).
  - Replaced the robotic fallback with an engaging, structured assistant prompt.
  - Enforced strict non-clinical disclaimers for symptom/diagnostic questions while formulating safe questions to ask providers.
- **Frontend refinement:**
  - Updated `AppointmentsListPage.tsx` initial state to show a fresh, personalized greeting without mock chat history.
- **Testing & Verification:**
  - Expanded `server/tests/assistant.test.js` to 11 test cases covering conversational check-ins, gratitude, identity, specialties, non-clinical boundaries, and fallback safety.
  - Full test suite verified: 70 backend tests passing across 14 suites, 11 frontend tests passing across 4 suites.
