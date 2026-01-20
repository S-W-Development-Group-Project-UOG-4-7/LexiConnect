import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../services/auth";

const normalizeRole = (role) => String(role || "").toLowerCase();

const ProtectedRoute = ({ allowedRoles, redirectTo = "/not-authorized", children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = normalizeRole(getRole() || localStorage.getItem("role"));
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    if (!role || !normalizedAllowed.includes(role)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

