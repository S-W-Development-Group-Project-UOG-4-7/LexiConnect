import { Outlet } from "react-router-dom";
import TopNav from "../components/AppNavbar";

const LawyerLayout = () => {
  const navItems = [
    { to: "/lawyer/dashboard", label: "Dashboard" },
    { to: "/lawyer/availability", label: "Availability" },
    { to: "/lawyer/token-queue", label: "Token Queue" },
    { to: "/lawyer/bookings/incoming", label: "Incoming Bookings" },
    { to: "/lawyer/cases/requests", label: "My Requests" },
    { to: "/lawyer/branches", label: "Branches" },
    { to: "/lawyer/services", label: "Services" },
    { to: "/lawyer/checklist", label: "Checklist" },
    { to: "/lawyer/kyc", label: "KYC Status" },
  ];

  return (
    <>
      <TopNav links={navItems} brand="LexiConnect Lawyer Dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </>
  );
};

export default LawyerLayout;

