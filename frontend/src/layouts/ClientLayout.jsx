import { Outlet } from "react-router-dom";
import TopNav from "../components/AppNavbar";

const ClientLayout = () => {
  const navItems = [
    { to: "/client/dashboard", label: "Dashboard" },
    { to: "/client/search", label: "Search Lawyers" },
    { to: "/client/manage-bookings", label: "My Bookings" },
  ];

  return (
    <>
      <TopNav links={navItems} brand="LexiConnect Client Portal" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </>
  );
};

export default ClientLayout;

