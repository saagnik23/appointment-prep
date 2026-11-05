# Appointment Prep

> **A private, responsive web application to organize user questions, self-reported medications, and follow-up actions into a concise, printable checklist for healthcare appointments.**

---

## 1. Product Overview

Patients often experience stress or forget critical questions, medication regimens, and follow-up items during short medical visits. **Appointment Prep** solves this by providing individuals with a private, focused workspace to:

- Record appointments with provider name, date/time, location, and preparation reminders.
- Draft questions in their own words, mark them as asked/not asked, and reorder them.
- Keep a self-reported log of their current medications (name, dose, frequency, notes) preserved verbatim.
- Track follow-up actions and target due dates.
- Generate a clean, structured, printable checklist with a dedicated handwritten notes area for their visit.

### Explicit Non-Goals & Medical Disclaimer

**Appointment Prep is not an electronic health record, diagnostic tool, telemedicine service, or clinical decision support system.**
- **No Medical Advice:** Does not interpret symptoms, triage, diagnose, or recommend treatments.
- **No Regimen Modification:** Never alters user-entered dosages or checks drug-drug interactions.
- **No Hallucinated Recommendations:** The checklist strictly and deterministically transforms user-entered notes without inventing missing information.

---

## 2. Architecture & Technical Stack

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons | Responsive, accessible SPA with print stylesheet |
| **Backend** | Node.js (v25+), Express REST API | Modular, secure REST API mounted at `/api/v1` |
| **Database** | MongoDB (v8+) via Mongoose | Embedded subdocuments for atomic updates and fast reads |
| **Security** | Helmet, CORS, Rate Limiting, bcrypt, JWT | Multi-tenant isolation and data protection |
| **Testing** | Jest, Supertest, MongoMemoryServer, Vitest, Testing Library | 100% automated coverage across API, UI, and E2E |

---

## 3. Repository Structure

```text
backendcia2/
├── client/                     # Frontend React + TypeScript application
│   ├── src/
│   │   ├── app/                # App router and protected route handlers
│   │   ├── components/         # Navbar, Footer, Modal, ConfirmDialog
│   │   ├── context/            # AuthContext (JWT & user state)
│   │   ├── features/
│   │   │   ├── auth/           # Login & Register views
│   │   │   ├── appointments/   # Dashboard, Details, and Form Modal
│   │   │   ├── questions/      # Question organizer & status toggles
│   │   │   ├── medications/    # Self-reported medication list
│   │   │   ├── follow-ups/     # Action items & target due dates
│   │   │   └── checklist/      # Printable checklist & PDF export
│   │   ├── services/           # Typed API client
│   │   ├── test/               # Vitest UI test suites
│   │   └── types/              # Domain TypeScript interfaces
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Backend Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Environment & DB connection
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── models/             # User and Appointment schemas
│   │   ├── modules/
│   │   │   ├── auth/           # Register, login, profile routes
│   │   │   └── appointments/   # Appointment & preparation items CRUD
│   │   ├── utils/              # Deterministic checklist transformer
│   │   ├── app.js              # Express app setup & SPA fallback
│   │   └── index.js            # Server entrypoint
│   └── tests/                  # Jest integration & E2E test suites
├── docs/                       # Project documentation
│   ├── CODEBASE_AUDIT.md       # Greenfield discovery & audit
│   ├── ARCHITECTURE.md         # System design & sequence diagrams
│   ├── PRD.md                  # Product requirements document
│   ├── TRD.md                  # Technical specification document
│   ├── API.md                  # REST API contract
│   ├── DECISIONS.md            # Architecture decision records (ADRs)
│   ├── WORKLOG.md              # Engineering loops log
│   └── TEST_REPORT.md          # Automated test execution report
├── .env.example                # Safe environment variables template
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 4. Getting Started

### Prerequisites
- Node.js (v20+ recommended, tested on v25.9.0)
- npm (v10+ recommended)
- MongoDB instance (optional for tests as `mongodb-memory-server` is built-in; required for local interactive development)

### Installation

Clone and install dependencies across the monorepo:

```bash
# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `JWT_SECRET` is set to a secure string in production environments.

### Development Mode

Run both the API server and Vite frontend concurrently:

```bash
npm run dev
```
- Client runs on `http://localhost:5173`
- Server runs on `http://localhost:5001` (with `/api/v1` and health check at `/health`)

---

## 5. Verification & Testing

The application includes unit tests, API integration tests with in-memory MongoDB, UI component tests, and a 12-step end-to-end journey test.

### Run All Tests
```bash
npm test
```

### Run Server Tests Only
```bash
npm run test:server
```

### Run Frontend Tests Only
```bash
npm run test:client
```

### Build for Production
```bash
npm run build
```

---

## 6. Security & Multi-Tenant Privacy

1. **Owner-Scoped Queries:** All database queries targeting appointments, questions, medications, or follow-ups explicitly filter by `{ _id: recordId, ownerId: req.user.id }`. Users can never query or manipulate records belonging to another patient.
2. **Password Security:** Passwords hashed with `bcrypt` (10 rounds). Plaintext passwords are never logged or stored.
3. **Safe Error Handling:** Centralized error handler masks internal database details and stack traces.
4. **Input Sanitization:** All incoming requests are validated using schema middleware before execution.
5. **Print Layout Privacy:** Navigation bars, action buttons, and edit controls are hidden in `@media print`, producing a clean, distraction-free document for printing or saving as PDF.

---

## 7. Database Backup & Restore

### Backup MongoDB
```bash
mongodump --uri="mongodb://127.0.0.1:27017/appointment_prep" --out=/path/to/backup/$(date +%F)
```

### Restore MongoDB
```bash
mongorestore --uri="mongodb://127.0.0.1:27017/appointment_prep" --drop /path/to/backup/2026-11-05/appointment_prep
```
