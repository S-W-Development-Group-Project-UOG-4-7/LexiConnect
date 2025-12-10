# LexiConnect – Team Instructions (Short)

## 1. Git Workflow

- Main branches:
  - `main` → final, stable code
  - `dev` → integration branch (everyone merges here)
- Personal feature branches (one per member):
  - `feature-thenu-booking`
  - `feature-chapa-search`
  - `feature-meths-documents`
  Test note: Sample commit by Methsarani (feature-meths-documents).

  - `feature-vithana-scheduling`
  - `feature-udavi-kyc`

### How each member works

1. Clone the repo (once):

   ```bash
   git clone https://github.com/S-W-Development-Group-Project-UOG-4-7/LexiConnect.git
   cd LexiConnect

Switch to dev branch and pull latest work:

git checkout dev
git pull origin dev


Create your own feature branch (each person does this only once):

# Thenu:
git checkout -b feature-thenu-booking

# Chapa:
git checkout -b feature-chapa-search

# Methsarani:
git checkout -b feature-meths-documents

# Vithana:
git checkout -b feature-vithana-scheduling

# Udavi:
git checkout -b feature-udavi-kyc


Work ONLY in your feature branch. When you finish a small part and want to save:

git status
git add .
git commit -m "short description of what you did"
git push origin your-branch-name


Then go to GitHub → open the repository → click Pull requests → New pull request.

Base branch: dev

Compare branch: your feature branch (for example, feature-chapa-search)

Create the PR.
The leader (Thenu) will review and merge into dev.

2. How to run the backend (FastAPI)

Open a terminal and go to the backend folder:

cd backend


Activate the Python virtual environment:

.\venv\Scripts\Activate


If this works, your terminal prompt will start with (venv).

Run the FastAPI server:

uvicorn app.main:app --reload


Open your browser and go to:

http://127.0.0.1:8000/health
You should see: {"status": "ok"}

http://127.0.0.1:8000/docs
You should see the FastAPI Swagger UI with all API endpoints.

To stop the server, go back to the terminal and press:

Ctrl + C

3. How to run the frontend (React)

Open another terminal (new window or new tab).

Go to the frontend folder:

cd "D:/Studies/LNBTI/Semester 5/SD-Project/LexiConnect/frontend"


Install dependencies (only the first time):

npm install


Run the development server:

npm run dev


Open your browser and go to:

http://localhost:5173/

You should see the LexiConnect React page with navigation links.

To stop the frontend dev server, press:

Ctrl + C

4. Member Responsibilities (This Week Until Interim)
Member 1 – Thenu (Auth + Booking)

Frontend pages (in frontend/src/pages/):

Login.jsx

Form: email, password

Calls POST /auth/login

On success: save token in localStorage and redirect to /search.

Register.jsx

Form: full name, email, phone, password, role (client/lawyer)

Calls POST /auth/register.

Booking.jsx

Inputs: date, time/slot, reason, selected lawyer and branch

Calls POST /bookings.

ManageBookings.jsx

On load: calls GET /bookings/my

Shows list of bookings (date, time, lawyer, status)

Provides cancel button → calls PATCH /bookings/{id}/cancel.

Backend (in backend/app/):

Database connection:

File: backend/app/database.py

Configure SQLAlchemy and PostgreSQL.

Models:

backend/app/models/user.py

backend/app/models/booking.py

Schemas:

backend/app/schemas/user.py

backend/app/schemas/booking.py

backend/app/schemas/auth.py

Auth router (backend/app/routers/auth.py):

POST /auth/register – register a new user.

POST /auth/login – login with JWT.

Booking router (backend/app/routers/bookings.py):

POST /bookings – create a booking.

GET /bookings/my – list bookings for the logged-in user.

PATCH /bookings/{id}/cancel – cancel a booking.

Member 2 – Chapa (Search + Profile)

Frontend (in frontend/src/pages/):

Search.jsx:

Filters: district, city, specialization, language.

Uses Axios to call GET /lawyers with these filters as query parameters.

Displays a list of lawyers with basic info and a “View Profile” button.

Profile.jsx:

Reads id from the URL (for example /profile/1).

Uses Axios to call GET /lawyers/{id}.

Displays lawyer details, branches, reviews.

Has a “Book Appointment” button that navigates to /booking/:lawyerId.

Backend:

Model file: backend/app/models/lawyer_profile.py.

Schema file: backend/app/schemas/lawyer.py.

Router file: backend/app/routers/lawyers.py:

GET /lawyers – list lawyers with optional filters.

GET /lawyers/{id} – get single lawyer details.

Member 3 – Methsarani (Documents + Admin Dashboard)

Frontend (in frontend/src/pages/):

DocumentUpload.jsx:

Dropdown: select one of “my bookings” from GET /bookings/my.

File input to choose a document.

Upload button: sends the file to POST /bookings/{booking_id}/documents using FormData.

Shows existing documents for the selected booking from GET /bookings/{booking_id}/documents.

AdminDashboard.jsx:

Calls GET /admin/overview.

Shows basic statistics: total users, total bookings, pending KYC.

Backend:

Model file: backend/app/models/document.py.

Schema file: backend/app/schemas/document.py.

Router file: backend/app/routers/documents.py:

POST /bookings/{booking_id}/documents – upload a document.

GET /bookings/{booking_id}/documents – list documents.

Admin router file: backend/app/routers/admin.py:

GET /admin/overview – return overview counts.

Member 4 – Vithana (Availability)

Frontend (in frontend/src/pages/):

AvailabilityEditor.jsx:

Form inputs: date, start time, end time, branch dropdown.

On submit: calls POST /availability.

On load: calls GET /availability?lawyer_id=my to list current availability slots.

Backend:

Model file: backend/app/models/availability.py.

Schema file: backend/app/schemas/availability.py.

Router file: backend/app/routers/availability.py:

POST /availability – create an availability slot.

GET /availability – list slots (optionally filtered by lawyer_id).

Member 5 – Udavi (KYC + Branches)

Frontend (in frontend/src/pages/):

KYCForm.jsx:

Form inputs: NIC, Bar ID, address, contact number, file input for bar certificate.

Submit: calls POST /kyc.

Shows KYC status from GET /kyc/my.

BranchManagement.jsx:

Form: name, district, city, address.

Submit: calls POST /branches.

Shows branches from GET /branches?lawyer_id=my.

Backend:

Model files:

backend/app/models/branch.py.

backend/app/models/kyc_submission.py.

Schema files:

backend/app/schemas/branch.py.

backend/app/schemas/kyc.py.

Routers:

backend/app/routers/branches.py:

POST /branches

GET /branches?lawyer_id=

backend/app/routers/kyc.py:

POST /kyc

GET /kyc/my