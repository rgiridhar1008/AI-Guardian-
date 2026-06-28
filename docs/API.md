# AI Guardian — API Documentation

> Complete REST API reference for the AI Guardian Decision Intelligence Platform.

Base URL: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs` (Swagger UI)

---

## Authentication

All endpoints except `/health`, `/login`, `/register`, and `/forgot-password` require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are valid for 12 hours and include the user's ID and role.

---

## Endpoints

### Health Check

```
GET /health
```

Returns system status. No authentication required.

**Response 200:**
```json
{
  "status": "healthy",
  "memory": "hindsight" | "local-fallback",
  "routing": "cascadeflow"
}
```

---

### POST /register

Create a new user account.

**Request:**
```json
{
  "email": "user@company.com",
  "full_name": "Jane Doe",
  "password": "SecureP@ss123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "user@company.com",
    "role": "auditor"
  }
}
```

**Errors:**
- `409` — Email already registered

---

### POST /login

Authenticate with existing credentials.

**Request:**
```json
{
  "email": "auditor@aiguardian.dev",
  "password": "Guardian123!"
}
```

**Response 200:** Same format as `/register`.

**Errors:**
- `401` — Incorrect email or password

---

### POST /forgot-password

Request a password reset link.

**Request:**
```json
{
  "email": "user@company.com"
}
```

**Response 200:**
```json
{
  "message": "If the account exists, a secure reset link has been issued."
}
```

---

### POST /upload

Upload a decision file (CSV, JSON, or XLSX) for parsing.

**Request:** `multipart/form-data` with a `file` field.

- Maximum file size: 10 MB
- Supported formats: `.csv`, `.json`, `.xlsx`, `.xlsm`

**Response 200:**
```json
{
  "filename": "decisions.csv",
  "rows": 42,
  "columns": ["name", "income", "credit_score", "decision"],
  "preview": [
    {"name": "John Doe", "income": "85000", "credit_score": "720", "decision": "Approved"}
  ]
}
```

**Errors:**
- `413` — File exceeds 10 MB limit
- `415` — Unsupported file format
- `422` — Could not parse file

---

### POST /analyze

### POST /explain

Run an intelligent audit on a decision. Both endpoints are identical.

**Request:**
```json
{
  "subject_name": "Arjun Mehta",
  "decision_type": "loan",
  "decision": "Review",
  "data": {
    "credit_score": 714,
    "income": 86000,
    "debt_ratio": 0.31,
    "region": "West"
  },
  "budget_usd": 0.05
}
```

**Response 200:**
```json
{
  "id": 6,
  "reference": "AG-A1B2C3",
  "subject_name": "Arjun Mehta",
  "decision_type": "loan",
  "decision": "Review",
  "explanation": "The decision was primarily influenced by...",
  "technical_explanation": "A feature-level review using...",
  "recommendations": [
    "Request human review when confidence is below 80%",
    "Record the decisive policy rule"
  ],
  "confidence": 0.82,
  "risk_score": 0.35,
  "status": "complete",
  "created_at": "2026-06-28T15:00:00Z",
  "routing": {
    "tier": "small",
    "model": "llama-3.1-8b-instant",
    "reason": "cascadeflow complexity score 1; small tier satisfies the $0.050 budget",
    "tokens": 720,
    "latency_ms": 450,
    "cost_usd": 0.000072
  },
  "memory_provider": "local-fallback"
}
```

---

### POST /similar

Search Hindsight memory for similar historical decisions.

**Request:**
```json
{
  "query": "loan applicants with moderate debt and stable income",
  "limit": 5
}
```

**Response 200:**
```json
{
  "query": "loan applicants with moderate debt and stable income",
  "results": [
    {
      "similarity": 87,
      "reference": "AG-1048",
      "outcome": "Approved",
      "explanation": "The decision was driven by eligibility...",
      "recommendations": ["Document the decisive features"],
      "source": "Hindsight local memory"
    }
  ]
}
```

---

### POST /bias

Run a fairness scan on a specific audit.

**Request:**
```json
{
  "audit_id": 1,
  "protected_attributes": ["gender", "age", "region", "income"]
}
```

**Response 200:**
```json
{
  "audit_id": 1,
  "fairness_score": 78,
  "findings": [
    {
      "attribute": "gender",
      "score": 0.22,
      "severity": "low",
      "finding": "No material disparity detected for gender."
    },
    {
      "attribute": "region",
      "score": 0.41,
      "severity": "medium",
      "finding": "Potential outcome disparity requires review for region."
    }
  ],
  "recommendation": "Require human review for high-severity findings."
}
```

---

### POST /drift

Compare model versions for outcome drift.

**Request:**
```json
{
  "versions": [
    {"version": "v1.0", "approval_rate": 0.71},
    {"version": "v2.0", "approval_rate": 0.69},
    {"version": "v3.0", "approval_rate": 0.62}
  ]
}
```

**Response 200:**
```json
{
  "versions": [
    {"version": "v1.0", "approval_rate": 0.71, "drift_percent": 0.0, "status": "stable"},
    {"version": "v2.0", "approval_rate": 0.69, "drift_percent": -2.0, "status": "stable"},
    {"version": "v3.0", "approval_rate": 0.62, "drift_percent": -9.0, "status": "alert"}
  ],
  "max_drift": 9.0,
  "recommendation": "Revalidate the latest model on protected cohorts before promotion."
}
```

---

### POST /feedback

Submit auditor feedback and corrections. Corrections are stored in Hindsight memory.

**Request:**
```json
{
  "audit_id": 1,
  "rating": 4,
  "correction": "The income threshold should be weighted more heavily."
}
```

**Response 200:**
```json
{
  "message": "Feedback retained for future audits"
}
```

---

### POST /report

Generate a downloadable PDF audit report with SHA-256 checksum.

**Request:**
```json
{
  "audit_id": 1
}
```

**Response 200:** Binary PDF stream with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="AG-1048-audit-report.pdf"`
- `X-Report-Checksum: <sha256_hex>`

---

### GET /dashboard

Returns dashboard statistics, trends, model usage, recent audits, and routing decisions.

**Response 200:**
```json
{
  "stats": {
    "total_audits": 5,
    "today_audits": 1,
    "models": 3,
    "bias_alerts": 2,
    "cost_saved": 0.05,
    "average_latency": 620,
    "memory_entries": 5,
    "success_rate": 40
  },
  "trends": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "approvals": [62, 66, 64, 71, 74, 78],
    "cost": [0.18, 0.16, 0.15, 0.12, 0.10, 0.08],
    "latency": [920, 860, 790, 680, 610, 540]
  },
  "model_usage": {"small": 2, "medium": 2, "large": 1},
  "recent": [],
  "routing": []
}
```

---

### GET /analytics

Returns approval/rejection rates, risk distribution, memory growth, and bias trends.

**Response 200:**
```json
{
  "approval_rate": 40.0,
  "rejection_rate": 20.0,
  "risk_distribution": {"low": 2, "medium": 1, "high": 2},
  "memory_growth": [8, 16, 31, 49, 72, 104],
  "bias_trend": [22, 20, 18, 15, 12, 9]
}
```

---

### GET /history

Returns all audits for the authenticated user, ordered by creation date descending.

**Response 200:** Array of audit objects.

---

### GET /reports

Returns metadata for all generated PDF reports for the authenticated user.

**Response 200:**
```json
[
  {
    "id": 1,
    "audit_id": 1,
    "checksum": "a3f2b8c9...",
    "created_at": "2026-06-28T15:00:00Z"
  }
]
```

---

### GET /routing

Returns all cascadeflow routing decisions, ordered by creation date descending.

**Response 200:** Array of routing log objects.

---

### DELETE /audit/{audit_id}

Delete an audit and all associated records (cascading).

**Response 204:** No content.

**Errors:**
- `404` — Audit not found or not owned by user

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

Common HTTP status codes:
- `401` — Authentication required or invalid token
- `404` — Resource not found
- `409` — Conflict (e.g., duplicate email)
- `413` — Payload too large
- `415` — Unsupported media type
- `422` — Validation error
- `429` — Rate limit exceeded (120 requests/minute per IP)
