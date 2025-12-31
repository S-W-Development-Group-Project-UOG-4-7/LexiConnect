import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import LandingPage from "../pages/LandingPage";
import NotAuthorized from "../pages/NotAuthorized";

import ProtectedRoute from "../components/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import ClientLayout from "../layouts/ClientLayout";
import LawyerLayout from "../layouts/LawyerLayout";
import AdminLayout from "../layouts/AdminLayout";

import { getRole } from "../services/auth";

// Client pages (real)
import Dashboard from "../pages/Dashboard";
import SearchLawyers from "../pages/SearchLawyers";

// Booking pages
import Booking from "../pages/Booking";
import ManageBookings from "../pages/ManageBookings";

// Feature pages
import DocumentsList from "../features/documents/pages/DocumentsList";
import DocumentUpload from "../features/documents/pages/DocumentUpload";
import ClientBookingDetailPage from "../features/bookings/pages/ClientBookingDetailPage";
import ClientIntakeSubmitPage from "../features/intake/pages/ClientIntakeSubmitPage";

// Disputes (client)
import SubmitDisputePage from "../features/disputes/SubmitDisputePage";
import ClientMyDisputesPage from "../features/disputes/ClientMyDisputesPage";
import DisputeDetailPage from "../features/disputes/DisputeDetailPage";

// Admin disputes
import AdminDisputesListPage from "../features/disputes/AdminDisputesListPage";
import AdminDisputeDetailPage from "../features/disputes/AdminDisputeDetailPage";

// Lawyer pages
import LawyerAvailabilityDashboard from "../components/LawyerAvailabilityDashboard";
import TokenQueue from "../pages/TokenQueue";
import BranchManagement from "../pages/BranchManagement";
import ServicePackages from "../pages/ServicePackages";
import ChecklistTemplates from "../pages/ChecklistTemplates";
import { LawyerKYC } from "../features/lawyer_kyc";
import LawyerIncomingBookingsPage from "../features/bookings/LawyerIncomingBookingsPage";
import LawyerBookingDetailPage from "../features/bookings/pages/LawyerBookingDetailPage";
import LawyerDocumentsView from "../features/documents/pages/LawyerDocumentsView";
import LawyerIntakeViewPage from "../features/intake/pages/LawyerIntakeViewPage";
import LawyerPublicProfile from "../pages/LawyerPublicProfile";

// Admin pages (real)
import AdminDashboard from "../pages/admin/AdminDashboard";
import KYCApproval from "../pages/admin/KYCApproval";
import AuditLog from "../pages/admin/AuditLog";

const DashboardRedirect = () => {
  const role = getRole() || localStorage.getItem("role");

  if (role === "client") return <Navigate to="/client/dashboard" replace />;
  if (role === "lawyer") return <Navigate to="/lawyer/dashboard" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

// ✅ Minimal Lawyer dashboard (no missing file import)
const LawyerDashboardHome = () => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white border border-slate-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold">Lawyer Dashboard</h1>
        <p className="text-slate-300 mt-1">
          Minimal dashboard for demo. Chapa/Vithana can improve later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/lawyer/bookings/incoming"
          className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:bg-slate-700"
        >
          <div className="text-lg font-semibold text-white">Incoming Bookings</div>
          <div className="text-slate-300 text-sm mt-1">Confirm or reject requests</div>
        </a>

        <a
          href="/lawyer/availability"
          className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:bg-slate-700"
        >
          <div className="text-lg font-semibold text-white">Availability</div>
          <div className="text-slate-300 text-sm mt-1">Manage time slots</div>
        </a>

        <a
          href="/lawyer/token-queue"
          className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:bg-slate-700"
        >
          <div className="text-lg font-semibold text-white">Token Queue</div>
          <div className="text-slate-300 text-sm mt-1">Today’s consultation queue</div>
        </a>

        <a
          href="/lawyer/kyc"
          className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:bg-slate-700"
        >
          <div className="text-lg font-semibold text-white">KYC</div>
          <div className="text-slate-300 text-sm mt-1">Submit or view status</div>
        </a>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

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
        {/* ✅ real pages */}
        <Route path="/client/dashboard" element={<Dashboard />} />
        <Route path="/client/search" element={<SearchLawyers />} />
        <Route path="/client/profile/:id" element={<LawyerPublicProfile />} />


        {/* ✅ Chapa pages MINIMAL (so you can demo but he still has work) */}
        <Route
          path="/client/profile/:id"
          element={<div className="text-white">Lawyer Profile (Chapa - TODO)</div>}
        />

        {/* Booking */}
        <Route path="/client/booking" element={<Booking />} />
        <Route path="/client/booking/:lawyerId" element={<Booking />} />

        <Route path="/client/manage-bookings" element={<ManageBookings />} />
        <Route
          path="/client/my-bookings"
          element={<Navigate to="/client/manage-bookings" replace />}
        />

        {/* Booking hub */}
        <Route path="/client/bookings/:bookingId" element={<ClientBookingDetailPage />} />
        <Route
          path="/client/bookings/:bookingId/intake"
          element={<ClientIntakeSubmitPage />}
        />

        {/* Docs */}
        <Route path="/client/bookings/:bookingId/documents" element={<DocumentsList />} />
        <Route
          path="/client/bookings/:bookingId/documents/upload"
          element={<DocumentUpload />}
        />

        {/* Disputes */}
        <Route path="/disputes/submit" element={<SubmitDisputePage />} />
        <Route path="/disputes/my" element={<ClientMyDisputesPage />} />
        <Route path="/disputes/:id" element={<DisputeDetailPage />} />
      </Route>

      {/* Lawyer area */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["lawyer"]}>
            <LawyerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/lawyer/dashboard" element={<LawyerDashboardHome />} />
        <Route path="/lawyer/availability" element={<LawyerAvailabilityDashboard />} />
        <Route path="/lawyer/token-queue" element={<TokenQueue />} />
        <Route path="/lawyer/branches" element={<BranchManagement />} />
        <Route path="/lawyer/services" element={<ServicePackages />} />
        <Route path="/lawyer/checklist" element={<ChecklistTemplates />} />
        <Route path="/lawyer/kyc" element={<LawyerKYC />} />
        <Route path="/lawyer/bookings/incoming" element={<LawyerIncomingBookingsPage />} />
        <Route path="/lawyer/bookings/:bookingId" element={<LawyerBookingDetailPage />} />
        <Route path="/lawyer/bookings/:bookingId/documents" element={<LawyerDocumentsView />} />
        <Route path="/lawyer/bookings/:bookingId/intake" element={<LawyerIntakeViewPage />} />
      </Route>

      {/* Admin area */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/kyc-approval" element={<KYCApproval />} />
        <Route path="/admin/audit-log" element={<AuditLog />} />

        {/* Dispute management */}
        <Route path="/admin/disputes" element={<AdminDisputesListPage />} />
        <Route path="/admin/disputes/:id" element={<AdminDisputeDetailPage />} />
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
      <Route path="/profile/:id" element={<Navigate to="/client/profile/:id" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* Fallback */}
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;
