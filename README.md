Legal Disclaimer
“LexiConnect is a neutral legal appointment facilitation platform developed strictly for academic purposes.
It does not advertise, promote, rank, or endorse any legal practitioner.
All lawyer profiles are standardized, admin-verified, and displayed solely based on user-selected filters.”

---

```md
# ⚖️ LexiConnect  
### Location-Based Lawyer Discovery & Appointment Platform (Sri Lanka)

LexiConnect is a **web-based legal appointment and compliance platform** developed as a **university group project**.  
It aims to modernize access to legal services in Sri Lanka by enabling users to **discover verified lawyers**, **book appointments**, and **manage legal consultations digitally**.

---

## 📌 Project Overview

- 🎓 **Academic Project** – Final Year / Software Development
- 🌍 **Target Region** – Sri Lanka
- 🗣 **Language Support** – Sinhala-first (English supported)
- 💻 **Platform** – Web Application (Responsive, PWA-ready)

---

## 🧩 Key Features (Interim Scope)

### 👤 Client
- User registration & login (JWT-based authentication)
- Search lawyers by:
  - District
  - City
  - Specialization
  - Language
- View verified lawyer profiles
- Book legal appointments
- Manage bookings (view, reschedule, cancel)

### 👨‍⚖️ Lawyer
- Public profile with specialization & availability
- Appointment visibility and management

---

## 🏗️ Project Structure

```

LexiConnect/
│
├── backend/        # FastAPI backend (Python)
│   ├── app/
│   ├── requirements.txt
│   └── venv/
│
├── frontend/       # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── docs/           # Reports, supervisor notes, task breakdown
│
├── diagrams/       # ERD, system architecture, UI wireframes
│
└── README.md

````

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React (Vite)
- 🎨 Tailwind CSS
- 🔗 Axios

### Backend
- 🚀 FastAPI (Python)
- 🔐 JWT Authentication
- 🗄 PostgreSQL

### Tools
- Git & GitHub (PR-based workflow)
- Docker (planned)
- Swagger UI (API testing)

---

## 🚀 Getting Started (Development)

### 🔹 Backend – FastAPI

1. Open a terminal and navigate to the backend:
   ```powershell
   cd backend
````

2. Activate virtual environment:

   ```powershell
   .\venv\Scripts\Activate
   ```

3. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Run the server:

   ```powershell
   uvicorn app.main:app --reload
   ```

5. API Documentation (Swagger):

   ```
   http://127.0.0.1:8000/docs
   ```

### 🔹 DB Setup with Docker + Alembic

1. **Start PostgreSQL using Docker Compose** (from repo root):

   ```powershell
   docker-compose up -d
   ```

2. **Configure environment variables**:

   Copy `backend/.env.example` to `backend/.env` and update values if needed:
   ```powershell
   cd backend
   copy .env.example .env
   ```

3. **Install dependencies** (if not already done):

   ```powershell
   pip install -r requirements.txt
   ```

4. **Create initial migration**:

   ```powershell
   alembic revision --autogenerate -m "Initial migration"
   ```

5. **Apply migrations to database**:

   ```powershell
   alembic upgrade head
   ```

6. **Verify database connection**:

   The FastAPI server will automatically connect on startup. Check the console for:
   ```
   ✅ USING DATABASE: postgresql+psycopg2://...
   ```

**Note:** For subsequent model changes, create new migrations with:
```powershell
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

---

### 🔹 Frontend – React + Vite

1. Open a new terminal:

   ```powershell
   cd frontend
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Start development server:

   ```powershell
   npm run dev
   ```

4. Access frontend:

   ```
   http://127.0.0.1:5173
   ```

---

## 🔀 Git Workflow (University Assessed)

* `main` → Stable, release-ready code
* `dev` → Integrated development branch
* `feature/*` → Individual member contributions
* All changes are merged via **Pull Requests**
* Individual contribution tracked via GitHub Insights

---

## 📅 Interim Milestone (Dec 11)

✔ Authentication (Register / Login)
✔ Lawyer search & profile view
✔ Appointment booking (basic)
✔ Client booking management
✔ Backend–Frontend integration

---

## 👥 Team – Group 06

| Name              | Role                               |
| ----------------- | ---------------------------------- |
| **D. Thenujayan** | Group Leader / Systems Integration |
| Y. Chapa          | UI / UX                            |
| W. A. Methsarani  | Localization & Forms               |
| D. Vithana        | QA & Data Integrity                |
| P. Udavi          | Documentation                      |

---

## 📄 License & Disclaimer

This project is developed **strictly for academic purposes**.
Not intended for commercial or legal deployment.

---

> *“Improving access to justice through structured, digital legal workflows.”*

Legal Disclaimer
“LexiConnect is a neutral legal appointment facilitation platform developed strictly for academic purposes.
It does not advertise, promote, rank, or endorse any legal practitioner.
All lawyer profiles are standardized, admin-verified, and displayed solely based on user-selected filters.”
