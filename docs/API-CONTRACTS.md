# LexiConnect – Basic API Contracts (Draft)

This document shows the expected request and response structures for the main endpoints.  
These can be refined later, but frontend and backend should follow this as a guideline.

---

## 1. Auth

### POST /auth/register

**Request body (example):**

```json
{
  "full_name": "Test User",
  "email": "test@example.com",
  "phone": "0771234567",
  "password": "password123",
  "role": "client"
}
Response (example):

json
Copy code
{
  "id": 1,
  "full_name": "Test User",
  "email": "test@example.com",
  "role": "client"
}
POST /auth/login
Request body:

json
Copy code
{
  "email": "test@example.com",
  "password": "password123"
}
Response:

json
Copy code
{
  "access_token": "string-jwt-token",
  "token_type": "bearer"
}
2. Search Lawyers
GET /lawyers?district=&city=&specialization=&language=
Response (example):

json
Copy code
[
  {
    "id": 1,
    "full_name": "A. Perera",
    "specialization": "Criminal Law",
    "district": "Colombo",
    "city": "Colombo 03",
    "languages": ["Sinhala", "English"],
    "rating": 4.5
  }
]
GET /lawyers/{id}
Response (example):

json
Copy code
{
  "id": 1,
  "full_name": "A. Perera",
  "specialization": "Criminal Law",
  "district": "Colombo",
  "city": "Colombo 03",
  "languages": ["Sinhala", "English"],
  "years_of_experience": 8,
  "is_verified": true,
  "branches": [
    {
      "id": 1,
      "name": "Main Chamber",
      "district": "Colombo",
      "city": "Colombo 03",
      "address": "123 Galle Road"
    }
  ],
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Very helpful and professional."
    }
  ]
}
3. Bookings
POST /bookings
Request body (example):

json
Copy code
{
  "lawyer_id": 1,
  "branch_id": 1,
  "date": "2025-12-10",
  "time": "10:00",
  "reason": "Land dispute"
}
Response (example):

json
Copy code
{
  "id": 1,
  "lawyer_id": 1,
  "branch_id": 1,
  "date": "2025-12-10",
  "time": "10:00",
  "status": "PENDING"
}
GET /bookings/my
Response (example):

json
Copy code
[
  {
    "id": 1,
    "lawyer_name": "A. Perera",
    "branch_name": "Main Chamber",
    "date": "2025-12-10",
    "time": "10:00",
    "status": "PENDING"
  }
]
PATCH /bookings/{id}/cancel
Response (example):

json
Copy code
{
  "id": 1,
  "status": "CANCELLED"
}
4. Documents
POST /bookings/{booking_id}/documents
Content-Type: multipart/form-data

Fields:

file – the uploaded document.

No strict response defined yet; for now can return:

json
Copy code
{
  "id": 1,
  "booking_id": 1,
  "file_name": "NIC.pdf",
  "uploaded_at": "2025-12-01T10:00:00Z"
}
GET /bookings/{booking_id}/documents
Response (example):

json
Copy code
[
  {
    "id": 1,
    "file_name": "NIC.pdf",
    "uploaded_at": "2025-12-01T10:00:00Z"
  }
]
5. Admin Overview
GET /admin/overview
Response (example):

json
Copy code
{
  "total_users": 25,
  "total_lawyers": 8,
  "total_bookings": 42,
  "pending_kyc": 3
}
6. Availability
GET /availability?lawyer_id=
Response (example):

json
Copy code
[
  {
    "id": 1,
    "lawyer_id": 1,
    "branch_id": 1,
    "start_time": "2025-12-10T09:00:00Z",
    "end_time": "2025-12-10T10:00:00Z",
    "max_bookings": 4
  }
]
7. Branches
GET /branches?lawyer_id=
Response (example):

json
Copy code
[
  {
    "id": 1,
    "name": "Main Chamber",
    "district": "Colombo",
    "city": "Colombo 03",
    "address": "123 Galle Road"
  }
]
8. KYC
GET /kyc/my
Response (example):

json
Copy code
{
  "status": "PENDING",
  "submitted_at": "2025-12-01T09:00:00Z"
}