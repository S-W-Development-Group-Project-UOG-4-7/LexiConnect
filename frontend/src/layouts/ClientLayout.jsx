import { Outlet, useLocation } from "react-router-dom";
import TopNav from "../components/AppNavbar";

const ClientLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/client/dashboard";
  const navItems = [
    { to: "/client/dashboard", label: "Dashboard" },
    { to: "/client/search", label: "Search Lawyers" },
    { to: "/client/manage-bookings", label: "My Bookings" },
    { to: "/client/cases", label: "My Cases" }

  ];

  return (
    <>
      <TopNav links={navItems} brand="LexiConnect Client Portal" />
      <main
        className={
          isDashboard
            ? "w-full"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        }
      >
        <Outlet />
      </main>
    </>
  );
};

export default ClientLayout;

