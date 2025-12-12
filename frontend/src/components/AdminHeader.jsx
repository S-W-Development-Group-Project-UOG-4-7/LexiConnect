import { Link, useLocation } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = ({ userName = "Admin User", userRole = "Admin" }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-left">
          <Link to="/admin/dashboard" className="admin-logo-link">
            <div className="admin-logo-icon">⚖</div>
            <div className="admin-logo-text">
              <span className="admin-logo-title">LexiConnect</span>
              <span className="admin-logo-subtitle">Admin Console</span>
            </div>
          </Link>
        </div>

        <nav className="admin-header-nav">
          <Link 
            to="/admin/dashboard" 
            className={`admin-nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/admin/kyc" 
            className={`admin-nav-link ${isActive('/admin/kyc') ? 'active' : ''}`}
          >
            KYC Approval
          </Link>
          <Link 
            to="/admin/audit" 
            className={`admin-nav-link ${isActive('/admin/audit') ? 'active' : ''}`}
          >
            Audit Log
          </Link>
        </nav>

        <div className="admin-header-right">
          <div className="admin-user-info">
            <span className="admin-user-name">{userName}</span>
            <span className="admin-user-role">{userRole}</span>
          </div>
          <button className="admin-logout-btn">
            <span>Logout</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

