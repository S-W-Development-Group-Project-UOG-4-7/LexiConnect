import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="diamond-pattern"></div>
      <Header userName="Jane Smith" userRole="Client" />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-header">
              <span className="welcome-star">★</span>
              <h1 className="welcome-title">WELCOME BACK</h1>
            </div>
            <h2 className="welcome-name">Jane Smith</h2>
            <p className="welcome-description">
              Access premium legal services from top-rated lawyers. Your legal journey starts here.
            </p>
          </section>

          {/* Main Feature Cards */}
          <section className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Search Lawyers</h3>
              <p className="feature-description">
                Find lawyers by specialization, location, and language preferences.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">My Bookings</h3>
              <p className="feature-description">
                View and manage your upcoming and past appointments.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3 className="feature-title">Quick Tips</h3>
              <ul className="feature-list">
                <li>Check lawyer reviews before booking</li>
                <li>Upload documents in advance</li>
                <li>Arrive 10 minutes early</li>
              </ul>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works">
            <div className="section-header">
              <span className="section-star">★</span>
              <h2 className="section-title">HOW IT WORKS</h2>
            </div>
            <h3 className="section-subtitle">Your Legal Journey</h3>
            <p className="section-description">
              Four simple steps to connect with the right legal professional.
            </p>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number step-1">1</div>
                <h4 className="step-title">Search & Filter</h4>
                <p className="step-description">
                  Browse lawyers by specialty, location, and preferred language.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number step-2">2</div>
                <h4 className="step-title">Review Profiles</h4>
                <p className="step-description">
                  Check ratings, reviews, and expertise to find your perfect match.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number step-3">3</div>
                <h4 className="step-title">Book Appointment</h4>
                <p className="step-description">
                  Schedule at your convenience with instant confirmation.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number step-4">4</div>
                <h4 className="step-title">Consultation</h4>
                <p className="step-description">
                  Attend your session and share your experience through reviews.
                </p>
              </div>
            </div>
          </section>

          {/* Additional Feature Cards */}
          <section className="additional-features">
            <div className="additional-card">
              <div className="additional-icon">🛡️</div>
              <h4 className="additional-title">Verified Lawyers</h4>
              <p className="additional-description">
                All legal professionals are KYC verified.
              </p>
            </div>

            <div className="additional-card">
              <div className="additional-icon">🕐</div>
              <h4 className="additional-title">24/7 Support</h4>
              <p className="additional-description">
                Round-the-clock assistance for all queries.
              </p>
            </div>

            <div className="additional-card">
              <div className="additional-icon">🏆</div>
              <h4 className="additional-title">Top Rated</h4>
              <p className="additional-description">
                Access to highly-rated legal experts.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

