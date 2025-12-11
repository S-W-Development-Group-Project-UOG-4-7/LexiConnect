import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="diamond-pattern"></div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon">⚖</div>
              <div className="login-logo-text">
                <span className="login-logo-title">LexiConnect</span>
                <span className="login-logo-subtitle">Legal Excellence Platform</span>
              </div>
            </div>
          </div>

          <div className="login-welcome">
            <h2>Welcome Back</h2>
            <p>Access your legal services portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-submit">
              Access Platform
            </button>
          </form>

          <div className="login-register">
            <span className="text-secondary">Don't have an account? </span>
            <a href="/register" className="link">Register Now</a>
          </div>

          <div className="demo-accounts">
            <div className="demo-header">
              <span className="demo-star">★</span>
              <span>Demo Accounts:</span>
            </div>
            <ul className="demo-list">
              <li>Client: any email / any password</li>
              <li>Lawyer: lawyer@example.com / any password</li>
              <li>Admin: admin@lexiconnect.com / any password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

