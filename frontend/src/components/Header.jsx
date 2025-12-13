import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ userName = "Jane Smith", userRole = "Client" }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/dashboard" className="logo-link">
            <div className="logo-icon">⚖</div>
            <div className="logo-text">
              <span className="logo-title">LexiConnect</span>
              <span className="logo-subtitle">Client Portal</span>
            </div>
          </Link>
        </div>

        <nav className="header-nav">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/search" 
            className={`nav-link ${isActive('/search') ? 'active' : ''}`}
          >
            Search Lawyers
          </Link>
          <Link 
            to="/bookings" 
            className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}
          >
            My Bookings
          </Link>
        </nav>

        <div className="header-right">
          <span className="user-info">{userName} {userRole}</span>
          <button className="logout-btn">
            <span>Logout</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

