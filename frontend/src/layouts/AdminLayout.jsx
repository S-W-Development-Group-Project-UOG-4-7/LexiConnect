import { Outlet } from "react-router-dom";
import TopNav from "../components/AppNavbar";

const AdminLayout = () => {
  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/kyc-approval", label: "KYC Approval" },
    { to: "/admin/audit-log", label: "Audit Log" },
  ];

  return (
    <>
      <TopNav links={navItems} brand="LexiConnect Admin Console" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </>
  );
};

export default AdminLayout;

