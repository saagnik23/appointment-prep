# REST API Specification — Appointment Prep

**Base URL:** `/api/v1`  
**Data Format:** `application/json`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method / Path:** `POST /api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - `201 Created`: `{ "user": { "id": "...", "name": "...", "email": "..." }, "token": "..." }`
  - `400 Bad Request`: Validation error or email already in use.

### 1.2 Login User
- **Method / Path:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "user": { "id": "...", "name": "...", "email": "..." }, "token": "..." }`
  - `401 Unauthorized`: Invalid email or password.

### 1.3 Get Current User Profile
- **Method / Path:** `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK`: `{ "user": { "id": "...", "name": "...", "email": "..." } }`
  - `401 Unauthorized`: Missing or invalid token.

---

## 2. Appointment Endpoints

All endpoints require `Authorization: Bearer <token>`.

### 2.1 List Appointments
- **Method / Path:** `GET /api/v1/appointments`
- **Query Params:** `status` (optional: `upcoming`, `completed`, `cancelled`), `search` (optional)
- **Response:**
  - `200 OK`: `[ { "id": "...", "title": "...", "providerName": "...", "scheduledAt": "...", "location": "...", "status": "upcoming", ... } ]`

### 2.2 Create Appointment
- **Method / Path:** `POST /api/v1/appointments`
- **Request Body:**
  ```json
  {
    "title": "Cardiology Follow-up",
    "providerName": "Dr. Sarah Smith",
    "scheduledAt": "2026-11-15T10:00:00.000Z",
    "location": "St. Jude Hospital, Suite 402",
    "notes": "Bring previous ECG records",
    "status": "upcoming"
  }
  ```
- **Response:**
  - `201 Created`: Full appointment object.

### 2.3 Get Appointment by ID
- **Method / Path:** `GET /api/v1/appointments/:appointmentId`
- **Response:**
  - `200 OK`: Appointment object with nested questions, medications, and followUps.
  - `404 Not Found`: If appointment does not exist or belongs to another user.

### 2.4 Update Appointment
- **Method / Path:** `PATCH /api/v1/appointments/:appointmentId`
- **Request Body:** Partial fields (`title`, `providerName`, `scheduledAt`, `location`, `notes`, `status`).
- **Response:**
  - `200 OK`: Updated appointment object.

### 2.5 Delete Appointment
- **Method / Path:** `DELETE /api/v1/appointments/:appointmentId`
- **Response:**
  - `200 OK`: `{ "message": "Appointment deleted successfully" }`

---

## 3. Preparation Items Endpoints

### 3.1 Questions
- **POST** `/api/v1/appointments/:appointmentId/questions`:
  - Body: `{ "text": "Should I stop blood thinners before the procedure?", "order": 0 }`
  - Status: `201 Created`
- **PATCH** `/api/v1/appointments/:appointmentId/questions/:questionId`:
  - Body: `{ "text": "...", "status": "asked" | "not_asked", "order": 1 }`
  - Status: `200 OK`
- **DELETE** `/api/v1/appointments/:appointmentId/questions/:questionId`:
  - Status: `200 OK`

### 3.2 Medications (User-Entered)
- **POST** `/api/v1/appointments/:appointmentId/medications`:
  - Body: `{ "name": "Metformin", "dose": "500 mg", "frequency": "Twice daily with meals", "notes": "Taking since 2024", "order": 0 }`
  - Status: `201 Created`
- **PATCH** `/api/v1/appointments/:appointmentId/medications/:medicationId`:
  - Body: `{ "name": "...", "dose": "...", "frequency": "...", "notes": "...", "order": 0 }`
  - Status: `200 OK`
- **DELETE** `/api/v1/appointments/:appointmentId/medications/:medicationId`:
  - Status: `200 OK`

### 3.3 Follow-ups
- **POST** `/api/v1/appointments/:appointmentId/follow-ups`:
  - Body: `{ "text": "Schedule 3-month lipid panel", "dueAt": "2027-02-15T00:00:00.000Z" }`
  - Status: `201 Created`
- **PATCH** `/api/v1/appointments/:appointmentId/follow-ups/:followUpId`:
  - Body: `{ "text": "...", "dueAt": "...", "status": "pending" | "completed" }`
  - Status: `200 OK`
- **DELETE** `/api/v1/appointments/:appointmentId/follow-ups/:followUpId`:
  - Status: `200 OK`

---

## 4. Checklist Endpoint

### 4.1 Generate Checklist
- **Method / Path:** `GET /api/v1/appointments/:appointmentId/checklist`
- **Response (200 OK):**
  ```json
  {
    "appointment": {
      "id": "672...",
      "title": "Cardiology Follow-up",
      "providerName": "Dr. Sarah Smith",
      "scheduledAt": "2026-11-15T10:00:00.000Z",
      "location": "St. Jude Hospital, Suite 402",
      "status": "upcoming",
      "notes": "Bring previous ECG records"
    },
    "sections": [
      {
        "id": "questions",
        "title": "Questions to ask",
        "items": [
          {
            "id": "q1",
            "text": "Should I stop blood thinners before the procedure?",
            "status": "not_asked",
            "order": 0
          }
        ]
      },
      {
        "id": "medications",
        "title": "Medication list entered by me",
        "items": [
          {
            "id": "m1",
            "name": "Metformin",
            "dose": "500 mg",
            "frequency": "Twice daily with meals",
            "notes": "Taking since 2024"
          }
        ]
      },
      {
        "id": "follow_ups",
        "title": "Follow-up actions and notes",
        "items": [
          {
            "id": "f1",
            "text": "Schedule 3-month lipid panel",
            "dueAt": "2027-02-15T00:00:00.000Z",
            "status": "pending"
          }
        ]
      }
    ],
    "notesArea": true,
    "disclaimer": "This checklist contains only user-recorded preparation notes. It does not contain medical advice, diagnosis, or clinical instructions."
  }
  ```

---

## 5. Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please review the highlighted fields.",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must not exceed 200 characters"
      }
    ]
  }
}
```
Codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)
