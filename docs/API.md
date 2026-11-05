# REST API Specification — Appointment Prep

**Base URL:** `/api/v1`  
**Data Format:** `application/json`  
**Authentication:** HttpOnly Session Cookie (`appointment_prep_session`) with CSRF Token (`XSRF-TOKEN` / `X-XSRF-TOKEN` header), or `Authorization: Bearer <token>` for programmatic API clients.

---

## 1. System Probes

### 1.1 Liveness Probe
- **Method / Path:** `GET /health`
- **Purpose:** Verifies that the HTTP service is running.
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-06T00:00:00.000Z",
    "service": "appointment-prep-api"
  }
  ```

### 1.2 Readiness Probe
- **Method / Path:** `GET /ready`
- **Purpose:** Verifies that the database connection is active and ready to accept traffic.
- **Responses:**
  - `200 OK`: `{ "status": "ready", "database": "connected", "timestamp": "..." }`
  - `503 Service Unavailable`: `{ "status": "not_ready", "database": "disconnected", "timestamp": "..." }`

---

## 2. Authentication Endpoints

### 2.1 Register User
- **Method / Path:** `POST /api/v1/auth/register`
- **Rate Limit:** Dedicated strict limiter (default 10 req / 15m)
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - `201 Created`: Sets `appointment_prep_session` (HttpOnly) and `XSRF-TOKEN` cookies.
    ```json
    {
      "user": { "id": "672...", "name": "Jane Doe", "email": "jane@example.com" },
      "csrfToken": "a3b4..."
    }
    ```
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Email already registered.

### 2.2 Login User
- **Method / Path:** `POST /api/v1/auth/login`
- **Rate Limit:** Dedicated strict limiter (default 10 req / 15m)
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - `200 OK`: Sets `appointment_prep_session` (HttpOnly) and `XSRF-TOKEN` cookies.
    ```json
    {
      "user": { "id": "672...", "name": "Jane Doe", "email": "jane@example.com" },
      "csrfToken": "a3b4..."
    }
    ```
  - `401 Unauthorized`: Invalid credentials.

### 2.3 Logout User
- **Method / Path:** `POST /api/v1/auth/logout`
- **Responses:**
  - `200 OK`: Clears session and CSRF cookies.
    ```json
    {
      "message": "Successfully signed out."
    }
    ```

### 2.4 Get Current User Profile
- **Method / Path:** `GET /api/v1/auth/me`
- **Responses:**
  - `200 OK`: `{ "user": { "id": "...", "name": "...", "email": "..." } }`
  - `401 Unauthorized`: Missing or expired session.

---

## 3. Appointment Endpoints

All endpoints require authentication. Mutating methods (`POST`, `PATCH`, `DELETE`) require the `X-XSRF-TOKEN` header when using browser cookie authentication.

### 3.1 List Appointments
- **Method / Path:** `GET /api/v1/appointments`
- **Query Parameters:**
  - `status`: (Optional) Must be one of `upcoming`, `completed`, `cancelled`. Returns 400 if invalid.
  - `search`: (Optional) Text string up to 100 characters. Returns 400 if longer.
- **Response (200 OK):**
  ```json
  [
    {
      "id": "672...",
      "title": "Cardiology Consultation",
      "providerName": "Dr. Sarah Smith",
      "scheduledAt": "2026-12-10T11:00:00.000Z",
      "location": "Suite 400",
      "status": "upcoming",
      "notes": "Fasting required",
      "questionsCount": 2,
      "medicationsCount": 1,
      "followUpsCount": 1,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
  ```

### 3.2 Create Appointment
- **Method / Path:** `POST /api/v1/appointments`
- **Request Body:**
  ```json
  {
    "title": "Cardiology Consultation",
    "providerName": "Dr. Sarah Smith",
    "scheduledAt": "2026-12-10T11:00:00.000Z",
    "location": "Suite 400",
    "notes": "Fasting required",
    "status": "upcoming"
  }
  ```
- **Response (201 Created):** Full appointment object.

### 3.3 Get Appointment by ID
- **Method / Path:** `GET /api/v1/appointments/:appointmentId`
- **Response (200 OK):** Full appointment object with nested questions, medications, and follow-ups.
- **Response (404 Not Found):** If appointment does not exist or belongs to another user.

### 3.4 Update Appointment
- **Method / Path:** `PATCH /api/v1/appointments/:appointmentId`
- **Request Body:** Partial fields (`title`, `providerName`, `scheduledAt`, `location`, `notes`, `status`).
- **Response (200 OK):** Updated appointment object.

### 3.5 Delete Appointment
- **Method / Path:** `DELETE /api/v1/appointments/:appointmentId`
- **Response (200 OK):** `{ "message": "Appointment and all associated preparation data deleted successfully." }`

---

## 4. Preparation Items Endpoints

### 4.1 Questions
- **POST** `/api/v1/appointments/:appointmentId/questions`:
  - Body: `{ "text": "Are there side effects?", "order": 0 }`
  - Status: `201 Created`
- **PATCH** `/api/v1/appointments/:appointmentId/questions/:questionId`:
  - Body: `{ "text": "...", "status": "asked" | "not_asked", "order": 0 }`
  - Status: `200 OK`
- **DELETE** `/api/v1/appointments/:appointmentId/questions/:questionId`:
  - Status: `200 OK`

### 4.2 Medications (Self-Reported by Patient)
- **POST** `/api/v1/appointments/:appointmentId/medications`:
  - Body: `{ "name": "Metformin", "dose": "500 mg", "frequency": "Twice daily", "notes": "With meals", "order": 0 }`
  - Status: `201 Created`
- **PATCH** `/api/v1/appointments/:appointmentId/medications/:medicationId`:
  - Body: `{ "name": "...", "dose": "...", "frequency": "...", "notes": "...", "order": 0 }`
  - Status: `200 OK`
- **DELETE** `/api/v1/appointments/:appointmentId/medications/:medicationId`:
  - Status: `200 OK`

### 4.3 Follow-up Actions
- **POST** `/api/v1/appointments/:appointmentId/follow-ups`:
  - Body: `{ "text": "Schedule lipid blood panel", "dueAt": "2027-01-15T00:00:00.000Z" }`
  - Status: `201 Created`
- **PATCH** `/api/v1/appointments/:appointmentId/follow-ups/:followUpId`:
  - Body: `{ "text": "...", "dueAt": "...", "status": "pending" | "completed" }`
  - Status: `200 OK`
- **DELETE** `/api/v1/appointments/:appointmentId/follow-ups/:followUpId`:
  - Status: `200 OK`

---

## 5. Checklist Presentation Endpoint

### 5.1 Generate Checklist
- **Method / Path:** `GET /api/v1/appointments/:appointmentId/checklist`
- **Response (200 OK):**
  ```json
  {
    "appointment": {
      "id": "672...",
      "title": "Cardiology Consultation",
      "providerName": "Dr. Sarah Smith",
      "scheduledAt": "2026-12-10T11:00:00.000Z",
      "location": "Suite 400",
      "status": "upcoming",
      "notes": "Fasting required"
    },
    "sections": [
      {
        "id": "questions",
        "title": "Questions to ask",
        "items": [...]
      },
      {
        "id": "medications",
        "title": "Medication list entered by me",
        "items": [...]
      },
      {
        "id": "follow_ups",
        "title": "Follow-up actions and notes",
        "items": [...]
      }
    ],
    "notesArea": true,
    "disclaimer": "This checklist is generated exclusively from patient-recorded notes to assist in preparation. It does not contain medical advice, diagnosis, or clinical recommendations."
  }
  ```

---

## 6. Assistant & Preparation Prompts

### 6.1 Chat with Prep Assistant
- **Method / Path:** `POST /api/v1/assistant/chat`
- **Authentication:** Required (`requireAuth` + CSRF verification for cookie clients)
- **Request Body:**
  ```json
  {
    "message": "What questions should I ask my doctor?"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "reply": "Here are 4 high-value questions patients often prioritize:\n1. \"What is the primary cause of my current symptoms?\"...",
      "suggestions": [
        "What questions should I ask my doctor?",
        "What should I bring to my visit?",
        "How to list my medications?"
      ]
    }
    ```
  - `400 Bad Request`: When message is empty or missing.
  - `401 Unauthorized`: When session cookie or Bearer token is missing.

---

## 7. Error Response Schema

All errors follow the standardized envelope:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please review the highlighted fields.",
    "details": [
      {
        "field": "title",
        "message": "Appointment title is required"
      }
    ]
  }
}
```

Standard Error Codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `CSRF_ERROR` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `TOO_MANY_REQUESTS` (429)
- `INTERNAL_ERROR` (500) — In production, all 500 error messages are masked with generic safe text.
