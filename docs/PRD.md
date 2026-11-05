# Product Requirements Document (PRD) — Appointment Prep

## 1. Product Overview
- **Name:** Appointment Prep
- **Type:** Private, responsive full-stack web application
- **Target Audience:** Any individual preparing for a healthcare appointment who needs to track what they want to ask, their current medications, and their follow-up action items.
- **Core Value Proposition:** Gives patients peace of mind by organizing user-entered questions, self-reported medications, and follow-up items into a clean, printable checklist for their doctor visits.

## 2. Goals & Non-Goals
### Goals
- Secure, authenticated, private user accounts.
- Complete appointment management (schedule, clinic/provider, location, notes, status).
- Question organizer (user's own words, asked status, reordering).
- Self-reported medication log (name, dose, frequency, notes) preserved without alteration.
- Follow-up action tracker (due dates, pending/completed).
- Deterministic appointment checklist with print and PDF export support.
- Fully responsive across mobile, tablet, and desktop viewports.
- Strict WCAG 2.2 AA accessibility practices.

### Explicit Non-Goals
- **No Clinical Advice:** Will never interpret symptoms, triage, diagnose, or recommend treatments.
- **No Medication Changes or Dosage Verification:** Will never infer missing dosages, check drug-drug interactions, or modify user input.
- **No Clinical EHR / Provider Scheduling:** Not an EHR system and will not interface with healthcare provider EHR systems unless explicitly scoped.
- **No Hallucinated Clinical Content:** Will never generate synthetic clinical recommendations or advise on medical emergencies.

## 3. Functional Requirements (FR)
- **FR-01 — Private Access & Multi-Tenancy:** Secure authentication with server-side authorization. Users can only access their own appointments and child entities.
- **FR-02 — Appointment Management:** CRUD operations on appointments (`title`, `providerName`, `scheduledAt`, `location`, `notes`, `status: upcoming | completed | cancelled`).
- **FR-03 — Question Organiser:** Add, edit, delete, reorder, and toggle asked/not_asked status.
- **FR-04 — Medication List:** Record user-entered medications (`name` [required], `dose`, `frequency`, `notes`).
- **FR-05 — Follow-up Actions:** Add, edit, delete, and toggle pending/completed status with optional due date.
- **FR-06 — Checklist Generation:** Generate a structured, printable view containing appointment header, questions, medications, follow-up items, and a dedicated blank notes area for the appointment visit.
- **FR-07 — Data Lifecycle & Cascade:** Full deletion of an appointment cascades atomically to all nested questions, medications, and follow-ups. Confirmation modals for destructive actions.
