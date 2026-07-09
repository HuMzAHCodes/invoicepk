# 📡 API_REFERENCE.md — InvoicePK API Routes

> This document is the CONTRACT between the frontend and backend developer.
> Backend implements exactly what is written here.
> Frontend calls exactly what is written here.
> Neither developer changes this document without notifying the other first.

---

## Base URL

| Environment | Base URL |
|---|---|
| Development | `http://localhost:3000/api` |
| Production | `https://invoicepk.vercel.app/api` |

---

## 🔐 Authentication

All routes except `/api/auth/register` and `/api/auth/login` require a valid Firebase ID token.

The frontend attaches it on every request like this:

```
Authorization: Bearer <firebase_id_token>
```

The backend verifies this token using Firebase Admin SDK in `lib/withAuth.ts`.

Unauthenticated or invalid token requests always return `401 Unauthorized`.

---

## 📦 Standard Response Shapes

Every API response — success or error — follows one of these two shapes. No exceptions.

### Success
```json
{
  "data": { ... }
}
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "status": 404
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid Firebase token |
| `FORBIDDEN` | 403 | Resource belongs to another user |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 422 | Invalid or missing request body fields |
| `INVOICE_LOCKED` | 409 | Cannot edit or delete a sent/paid invoice |
| `LIMIT_EXCEEDED` | 429 | Free tier invoice limit reached (5/month) |
| `SERVER_ERROR` | 500 | Unexpected server error |

---

## 👤 Auth Routes

### `POST /api/auth/register`

Register a new user. Creates a Firebase account and an empty Business document in MongoDB.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `201`:**
```json
{
  "data": {
    "user": { "id": "firebase-uid", "email": "user@example.com" },
    "message": "Account created. Please verify your email."
  }
}
```

---

### `POST /api/auth/login`

Login an existing user and return Firebase session token.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `200`:**
```json
{
  "data": {
    "user": { "id": "firebase-uid", "email": "user@example.com" },
    "token": "firebase-id-token-string"
  }
}
```

---

## 🏢 Business Profile Routes

### `GET /api/business`

Get the authenticated user's business profile.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "data": {
    "id": "mongo-object-id",
    "name": "Ali Raza Consulting",
    "ntn": "1234567-8",
    "strn": "12-00-1234-567-89",
    "address": "Lahore, Punjab, Pakistan",
    "logoUrl": "https://res.cloudinary.com/invoicepk/image/upload/logos/uuid.png",
    "defaultGstRate": 17,
    "currency": "PKR",
    "plan": "free"
  }
}
```

> `plan` is read-only via this API for MVP — no endpoint to change it yet, since
> payment integration is Phase 2 (see `LAUNCH_STRATEGY.md`). Upgrading a business to
> `pro` is a manual database update for now.

**Response `404`** if business profile not yet created (new user):
```json
{
  "error": { "code": "NOT_FOUND", "message": "Business profile not found.", "status": 404 }
}
```

---

### `PUT /api/business`

Update the business profile. Partial updates supported — only send fields you want to change.

**Headers:** `Authorization: Bearer <token>`

**Body (all fields optional):**
```json
{
  "name": "Updated Business Name",
  "ntn": "1234567-8",
  "strn": "12-00-1234-567-89",
  "address": "Karachi, Pakistan",
  "defaultGstRate": 0,
  "currency": "PKR"
}
```

**Response `200`:** Updated business object (same shape as GET /api/business).

---

### `POST /api/business/logo`

Upload a business logo to Cloudinary. Returns the Cloudinary URL which is saved to the business document.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Body:** `logo` field — image file (PNG or JPG, max 2MB)

**Response `200`:**
```json
{
  "data": {
    "logoUrl": "https://res.cloudinary.com/invoicepk/image/upload/logos/uuid.png"
  }
}
```

---

## 👥 Client Routes

### `GET /api/clients`

List all clients for the authenticated business.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Filter by name or email (optional) |
| `page` | number | Page number, default: 1 |
| `limit` | number | Results per page, default: 20 |

**Response `200`:**
```json
{
  "data": {
    "clients": [
      {
        "id": "mongo-object-id",
        "name": "Acme Corp",
        "email": "accounts@acme.pk",
        "phone": "+92-300-1234567",
        "address": "Karachi, Pakistan",
        "ntn": "9876543-2",
        "isCorporate": true
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

---

### `POST /api/clients`

Create a new client.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Acme Corp",
  "email": "accounts@acme.pk",
  "phone": "+92-300-1234567",
  "address": "Karachi, Pakistan",
  "ntn": "9876543-2",
  "isCorporate": true
}
```

**Required fields:** `name`
**Optional fields:** `email`, `phone`, `address`, `ntn`, `isCorporate`

**Response `201`:** Created client object (same shape as item in GET /api/clients).

---

### `PUT /api/clients/:id`

Update an existing client. Partial updates supported.

**Headers:** `Authorization: Bearer <token>`

**Body:** Any subset of client fields.

**Response `200`:** Updated client object.

**Response `404`:** Client not found or belongs to another business.

---

### `DELETE /api/clients/:id`

Delete a client.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "data": { "message": "Client deleted successfully." }
}
```

**Response `404`:** Client not found or belongs to another business.

---

## 🧾 Invoice Routes

### `GET /api/invoices`

List all invoices for the authenticated business.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter: `draft`, `sent`, `paid` (optional) |
| `client_id` | string | Filter by client MongoDB ID (optional) |
| `from` | string | Issue date start — ISO 8601 e.g. `2026-01-01` (optional) |
| `to` | string | Issue date end — ISO 8601 (optional) |
| `page` | number | Page number, default: 1 |
| `limit` | number | Results per page, default: 20 |

**Response `200`:**
```json
{
  "data": {
    "invoices": [
      {
        "id": "mongo-object-id",
        "invoiceNumber": "INV-001",
        "client": { "id": "mongo-object-id", "name": "Acme Corp" },
        "status": "sent",
        "subtotal": 100000,
        "gstAmount": 17000,
        "total": 117000,
        "netPayable": 114000,
        "currency": "PKR",
        "issueDate": "2026-06-01",
        "dueDate": "2026-06-30"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

### `POST /api/invoices`

Create a new invoice. Backend recalculates all totals server-side — do not trust client-submitted totals.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "clientId": "mongo-object-id",
  "issueDate": "2026-06-01",
  "dueDate": "2026-06-30",
  "currency": "PKR",
  "gstType": "standard",
  "gstRate": 17,
  "whtApplicable": true,
  "whtRate": 3,
  "notes": "Payment due within 30 days.",
  "items": [
    {
      "description": "Website Development",
      "quantity": 1,
      "unitPrice": 100000,
      "sortOrder": 0
    },
    {
      "description": "UI/UX Design",
      "quantity": 2,
      "unitPrice": 25000,
      "sortOrder": 1
    }
  ]
}
```

**`gstType` values:**
| Value | Meaning |
|---|---|
| `standard` | Apply `gstRate` percent (e.g. 17%) |
| `zero_rated` | 0% GST — IT export services |
| `exempt` | GST does not apply |

**Required fields:** `issueDate`, `items` (at least one item), `gstType`
**Optional fields:** `clientId`, `dueDate`, `currency`, `gstRate`, `whtApplicable`, `whtRate`, `notes`

**Response `201`:**
```json
{
  "data": {
    "id": "mongo-object-id",
    "invoiceNumber": "INV-003",
    "status": "draft",
    "subtotal": 150000,
    "gstAmount": 25500,
    "total": 175500,
    "whtAmount": 4500,
    "netPayable": 171000,
    "currency": "PKR",
    "issueDate": "2026-06-01",
    "dueDate": "2026-06-30",
    "items": [
      { "description": "Website Development", "quantity": 1, "unitPrice": 100000, "amount": 100000, "sortOrder": 0 },
      { "description": "UI/UX Design", "quantity": 2, "unitPrice": 25000, "amount": 50000, "sortOrder": 1 }
    ]
  }
}
```

**Response `429`:** Free tier limit of 5 invoices/month reached.

---

### `GET /api/invoices/:id`

Get a single invoice with all line items and client info.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "data": {
    "id": "mongo-object-id",
    "invoiceNumber": "INV-001",
    "status": "draft",
    "client": {
      "id": "mongo-object-id",
      "name": "Acme Corp",
      "email": "accounts@acme.pk",
      "address": "Karachi, Pakistan",
      "ntn": "9876543-2"
    },
    "issueDate": "2026-06-01",
    "dueDate": "2026-06-30",
    "currency": "PKR",
    "gstType": "standard",
    "gstRate": 17,
    "subtotal": 100000,
    "gstAmount": 17000,
    "total": 117000,
    "whtApplicable": true,
    "whtRate": 3,
    "whtAmount": 3000,
    "netPayable": 114000,
    "notes": "Payment due within 30 days.",
    "pdfUrl": null,
    "items": [
      { "description": "Website Development", "quantity": 1, "unitPrice": 100000, "amount": 100000, "sortOrder": 0 }
    ]
  }
}
```

**Response `404`:** Invoice not found or belongs to another business.

---

### `PUT /api/invoices/:id`

Update an invoice. Only allowed when status is `draft`. Totals are recalculated server-side.

**Headers:** `Authorization: Bearer <token>`

**Body:** Any subset of invoice fields (same shape as POST body).

**Response `200`:** Updated invoice object (same shape as GET /api/invoices/:id).

**Response `409`:** Invoice is locked — status is `sent` or `paid`.

---

### `PATCH /api/invoices/:id/status`

Transition an invoice status. Only valid transitions are allowed.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{ "status": "sent" }
```

**Valid transitions:**
```
draft → sent → paid
```

Going backwards (e.g. `paid → sent`) is not allowed.

**Response `200`:**
```json
{
  "data": {
    "id": "mongo-object-id",
    "invoiceNumber": "INV-001",
    "status": "sent"
  }
}
```

**Response `409`:** Invalid status transition.

---

### `DELETE /api/invoices/:id`

Delete an invoice. Only allowed when status is `draft`.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "data": { "message": "Invoice deleted successfully." }
}
```

**Response `409`:** Cannot delete a sent or paid invoice.

---

## 📄 PDF Routes

### `GET /api/invoices/:id/pdf`

Generate and stream a PDF for the given invoice directly to the browser.

**Headers:** `Authorization: Bearer <token>`

**Response:** Binary PDF stream

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-001_Acme_Corp.pdf"
```

**Response `404`:** Invoice not found.

---

### `POST /api/invoices/:id/pdf/save`

Generate a PDF and save it to Cloudinary. Stores the URL in the invoice document.

**Headers:** `Authorization: Bearer <token>`

**Body:** _(empty)_

**Response `200`:**
```json
{
  "data": {
    "pdfUrl": "https://res.cloudinary.com/invoicepk/raw/upload/pdfs/INV-001_Acme_Corp.pdf"
  }
}
```

---

## 📊 Dashboard Routes

### `GET /api/dashboard/stats`

Get summary statistics for the authenticated business.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "data": {
    "totalInvoices": 42,
    "byStatus": {
      "draft": 5,
      "sent": 12,
      "paid": 25
    },
    "revenueThisMonth": 450000,
    "revenueCurrency": "PKR",
    "outstandingAmount": 175000
  }
}
```

---

## 🔁 Console Log Format (Backend Reference)

Every route logs in this format so the frontend developer can trace calls during integration:

```
[METHOD /api/route] Description | key: value | status: XXX
```

Examples:
```
[POST /api/invoices] Request received
[POST /api/invoices] uid: abc123 | clientId: xyz456
[POST /api/invoices] GST calculated | subtotal: 100000 | gstAmount: 17000
[POST /api/invoices] Invoice created | invoiceId: 64a... | invoiceNumber: INV-003 | status: 201
```

---

*Last updated: June 2026 | This document is the API contract — do not change without team discussion*
