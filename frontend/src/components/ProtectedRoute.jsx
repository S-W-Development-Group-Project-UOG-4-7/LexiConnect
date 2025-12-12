import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../services/auth";

const ProtectedRoute = ({ allowedRoles, children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = getRole();
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

