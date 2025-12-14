import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Booking from "../pages/Booking";
import ManageBookings from "../pages/ManageBookings";
import BranchManagement from "../pages/BranchManagement";
import ServicePackages from "../pages/ServicePackages";

import AvailabilityEditor from "../pages/AvailabilityEditor";
import TokenQueue from "../pages/TokenQueue";
import NotAuthorized from "../pages/NotAuthorized";
import LandingRedirect from "../pages/LandingRedirect";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import ClientLayout from "../layouts/ClientLayout";
import LawyerLayout from "../layouts/LawyerLayout";
import AdminLayout from "../layouts/AdminLayout";
import { getRole } from "../services/auth";

const DashboardRedirect = () => {
  const role = getRole() || localStorage.getItem("role");
  
  if (role === "client") {
    return <Navigate to="/client/dashboard" replace />;
  } else if (role === "lawyer") {
    return <Navigate to="/lawyer/dashboard" replace />;
  } else if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    // Fallback to client dashboard
    return <Navigate to="/client/dashboard" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingRedirect />} />

      {/* Dashboard redirect */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Client area */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/client/dashboard" element={<div>Client Dashboard (placeholder)</div>} />
        <Route path="/client/search" element={<div>Search Page (Chapa)</div>} />
        <Route path="/client/profile/:id" element={<div>Profile Page (Chapa)</div>} />
        <Route path="/client/booking" element={<Booking />} />
        <Route path="/client/booking/:lawyerId" element={<Booking />} />
        <Route path="/client/manage-bookings" element={<ManageBookings />} />
        <Route path="/client/my-bookings" element={<Navigate to="/client/manage-bookings" replace />} />
      </Route>

      {/* Lawyer area */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["lawyer"]}>
            <LawyerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/lawyer/dashboard" element={<div>Lawyer Dashboard (placeholder)</div>} />
        <Route path="/lawyer/availability" element={<AvailabilityEditor />} />
        <Route path="/lawyer/token-queue" element={<TokenQueue />} />
        <Route path="/lawyer/branches" element={<BranchManagement />} />
        <Route path="/lawyer/services" element={<ServicePackages />} />
        <Route path="/lawyer/checklist" element={<div>Checklist Page (placeholder)</div>} />
        <Route path="/lawyer/kyc" element={<div>KYC Form Page (Udavi)</div>} />
      </Route>

      {/* Admin area */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<div>Admin Dashboard Page (Methsarani)</div>} />
        <Route path="/admin/kyc-approval" element={<div>KYC Approval Page (Methsarani)</div>} />
        <Route path="/admin/audit-log" element={<div>Audit Log Page (Methsarani)</div>} />
      </Route>

      {/* Legacy paths redirect to new client routes */}
      <Route
        path="/booking/:lawyerId"
        element={<Navigate to="/client/booking/:lawyerId" replace />}
      />
      <Route path="/booking" element={<Navigate to="/client/booking" replace />} />
      <Route
        path="/manage-bookings"
        element={<Navigate to="/client/manage-bookings" replace />}
      />
      <Route
        path="/my-bookings"
        element={<Navigate to="/client/manage-bookings" replace />}
      />
      <Route path="/search" element={<Navigate to="/client/search" replace />} />
      <Route
        path="/profile/:id"
        element={<Navigate to="/client/profile/:id" replace />}
      />
      <Route path="/documents" element={<div>Document Upload Page (Methsarani)</div>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* Fallback */}
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;

