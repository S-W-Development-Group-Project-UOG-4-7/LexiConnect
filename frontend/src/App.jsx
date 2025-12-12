import { Routes, Route, Navigate } from "react-router-dom";
import AvailabilityEditor from "./pages/AvailabilityEditor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import ManageBookings from "./pages/ManageBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotAuthorized from "./pages/NotAuthorized";
import LandingRedirect from "./pages/LandingRedirect";
import { getRole, isLoggedIn, logout } from "./services/auth";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<LandingRedirect />} />

      {/* Thenu – Auth + Booking */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/booking" element={<Booking />} />
      <Route
        path="/booking/:lawyerId"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <Booking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-bookings"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ManageBookings />
          </ProtectedRoute>
        }
      />

      {/* Redirect old route */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ManageBookings />
          </ProtectedRoute>
        }
      />
      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* Chapa – Search + Profile */}
      <Route path="/search" element={<div>Search Page (Chapa)</div>} />
      <Route path="/profile/:id" element={<div>Profile Page (Chapa)</div>} />

      {/* Methsarani – Documents + Admin */}
      <Route path="/documents" element={<div>Document Upload Page (Methsarani)</div>} />
      <Route path="/admin" element={<div>Admin Dashboard Page (Methsarani)</div>} />

      {/* Vithana – Availability */}
      <Route path="/availability" element={<AvailabilityEditor />} />

      {/* Udavi – KYC + Branches */}
      <Route path="/kyc" element={<div>KYC Form Page (Udavi)</div>} />
      <Route path="/branches" element={<div>Branch Management Page (Udavi)</div>} />

      {/* Fallback */}
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
  );
}

export default App;
