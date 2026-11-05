# Technical Requirements Document (TRD) — Appointment Prep

## 1. Technical Stack

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 / 19, TypeScript, Vite | Fast, responsive single-page application |
| **Styling & Icons** | Tailwind CSS / Lucide React | Clean, calm aesthetic with accessible focus rings and print stylesheet |
| **Backend** | Node.js (v25+) & Express | Modular REST API adhering to `/api/v1` specification |
| **Database** | MongoDB (v8+) via Mongoose | Flexible document model with embedded arrays and indexing |
| **Validation** | Express-Validator / Custom Schemas | Strict input sanitization and validation on all routes |
| **Authentication** | JWT (JSON Web Tokens) & HTTP-only cookies / Bearer auth | Stateless, secure, private multi-tenant access control |
| **Testing** | Vitest, Supertest, React Testing Library | Rigorous unit, API integration, and UI testing |

## 2. High-Level Architecture

```text
                  REACT CLIENT (Vite + TS)
                              |
                     HTTPS / JSON REST
                              |
                              v
                  EXPRESS REST API (/api/v1)
        ---------------------------------------------
        |           |             |                 |
     Security      Auth        Validation        Controllers
    (Helmet/CORS) (JWT/User)  (Middleware)      (HTTP logic)
        |           |             |                 |
        ---------------------------------------------
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

## 3. Database Schema Specification

### User Schema (`User`)
- `_id`: ObjectId
- `name`: String, required, trimmed
- `email`: String, required, lowercase, unique index
- `passwordHash`: String, required (bcrypt hash)
- `createdAt`, `updatedAt`: Timestamps

### Appointment Schema (`Appointment`)
- `_id`: ObjectId
- `ownerId`: ObjectId (ref: User, index)
- `title`: String, required, max 200 chars
- `providerName`: String, optional
- `scheduledAt`: Date, optional
- `location`: String, optional
- `notes`: String, optional
- `status`: Enum (`upcoming`, `completed`, `cancelled`), default `upcoming`
- `questions`: Array of:
  - `_id`: ObjectId (auto-generated)
  - `text`: String, required
  - `status`: Enum (`not_asked`, `asked`), default `not_asked`
  - `order`: Number, default 0
  - `createdAt`, `updatedAt`: Timestamps
- `medications`: Array of:
  - `_id`: ObjectId (auto-generated)
  - `name`: String, required
  - `dose`: String, optional
  - `frequency`: String, optional
  - `notes`: String, optional
  - `order`: Number, default 0
  - `createdAt`, `updatedAt`: Timestamps
- `followUps`: Array of:
  - `_id`: ObjectId (auto-generated)
  - `text`: String, required
  - `dueAt`: Date, optional
  - `status`: Enum (`pending`, `completed`), default `pending`
  - `createdAt`, `updatedAt`: Timestamps
- `createdAt`, `updatedAt`: Timestamps

Indexes:
- `{ ownerId: 1, scheduledAt: -1 }`
- `{ ownerId: 1, status: 1 }`

## 4. Security & Privacy Guarantees
- Passwords hashed with bcrypt (rounds = 10).
- All `/api/v1/appointments` endpoints require valid JWT authentication.
- All MongoDB queries targeting an appointment or its subdocuments MUST include `{ _id: appointmentId, ownerId: req.user.id }`.
- Request body limits to prevent payload attacks.
- Standardized error handling suppressing database details and stack traces in production.
- Print media styling specifically formatted for A4 / Letter paper with navigation headers hidden.
