import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../services/auth";

const LandingRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { replace: true });
      return;
    }
    const role = getRole();
    if (role === "client") {
      navigate("/client/search", { replace: true });
    } else if (role === "lawyer") {
      navigate("/lawyer/availability", { replace: true });
    } else if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default LandingRedirect;

