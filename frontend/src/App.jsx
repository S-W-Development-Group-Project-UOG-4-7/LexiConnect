import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import ManageBookings from "./pages/ManageBookings";

function App() {
  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>LexiConnect</h1>

      {/* Simple nav for now */}
      <nav style={{ marginBottom: "1rem" }}>
        {/* Thenu */}
        <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
        <Link to="/register" style={{ marginRight: "1rem" }}>Register</Link>
        <Link to="/booking" style={{ marginRight: "1rem" }}>Booking</Link>
        <Link to="/manage-bookings" style={{ marginRight: "1rem" }}>My Bookings</Link>

        {/* Chapa */}
        <Link to="/search" style={{ marginRight: "1rem" }}>Search Lawyers</Link>

        {/* Methsarani */}
        <Link to="/documents" style={{ marginRight: "1rem" }}>Documents</Link>
        <Link to="/admin" style={{ marginRight: "1rem" }}>Admin</Link>

        {/* Vithana */}
        <Link to="/availability" style={{ marginRight: "1rem" }}>Availability</Link>

        {/* Udavi */}
        <Link to="/kyc" style={{ marginRight: "1rem" }}>KYC</Link>
        <Link to="/branches" style={{ marginRight: "1rem" }}>Branches</Link>
      </nav>

      <Routes>
        {/* Thenu – Auth + Booking */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking/:lawyerId" element={<Booking />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/manage-bookings" element={<ManageBookings />} />
        <Route path="/my-bookings" element={<ManageBookings />} />

        {/* Chapa – Search + Profile */}
        <Route path="/search" element={<div>Search Page (Chapa)</div>} />
        <Route path="/profile/:id" element={<div>Profile Page (Chapa)</div>} />

        {/* Methsarani – Documents + Admin */}
        <Route path="/documents" element={<div>Document Upload Page (Methsarani)</div>} />
        <Route path="/admin" element={<div>Admin Dashboard Page (Methsarani)</div>} />

        {/* Vithana – Availability */}
        <Route path="/availability" element={<div>Availability Editor Page (Vithana)</div>} />

        {/* Udavi – KYC + Branches */}
        <Route path="/kyc" element={<div>KYC Form Page (Udavi)</div>} />
        <Route path="/branches" element={<div>Branch Management Page (Udavi)</div>} />

        {/* Default */}
        <Route
          path="*"
          element={<div>Welcome to LexiConnect. Use the links above to navigate.</div>}
        />
      </Routes>
    </div>
  );
}

export default App;
