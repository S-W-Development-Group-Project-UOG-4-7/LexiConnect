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

## 🚀 Run Locally (Windows)

### 📦 Start Database

From the repository root, start PostgreSQL using Docker Compose:

```powershell
docker compose up -d db
```

This will start the PostgreSQL database in the background. Verify it's running:
```powershell
docker ps
```

### 🔧 Backend Setup

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Create virtual environment (if missing):**
   ```powershell
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```powershell
   .\venv\Scripts\Activate
   ```

4. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   ```powershell
   copy .env.example .env
   ```
   **⚠️ Important:** Do NOT commit the `.env` file to Git. Edit `.env` if you need to change database credentials.

6. **Run database migrations:**
   ```powershell
   alembic upgrade head
   ```

7. **Start the FastAPI server:**
   ```powershell
   uvicorn app.main:app --reload
   ```

   The API will be available at: `http://127.0.0.1:8000`
   
   API Documentation (Swagger): `http://127.0.0.1:8000/docs`

### 🎨 Frontend Setup

1. **Navigate to frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start development server:**
   ```powershell
   npm run dev
   ```

   The frontend will be available at: `http://127.0.0.1:5173`

---

### 🔍 Troubleshooting

#### "password authentication failed"
- **Cause:** Database credentials in `.env` don't match Docker Compose settings
- **Solution:** Check `backend/.env` matches the database credentials in `docker-compose.yml`:
  - `POSTGRES_USER=lexiconnect`
  - `POSTGRES_PASSWORD=lexiconnect`
  - `POSTGRES_DB=lexiconnect`

#### "DATABASE_URL not set"
- **Cause:** Missing or incorrect `DATABASE_URL` in `backend/.env`
- **Solution:** 
  1. Ensure you've copied `backend/.env.example` to `backend/.env`
  2. Verify `DATABASE_URL` in `.env` matches the format:
     ```
     DATABASE_URL=postgresql+psycopg2://lexiconnect:lexiconnect@localhost:5432/lexiconnect
     ```

#### "alembic revision mismatch / run upgrade head"
- **Cause:** Database schema is out of sync with migration files
- **Solution:** 
  1. Ensure you're in the `backend` directory
  2. Run: `alembic upgrade head`
  3. If issues persist, check that all migration files in `backend/alembic/versions/` are committed to Git
  4. If the database is fresh/empty, you may need to reset: drop and recreate the database, then run `alembic upgrade head`

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
