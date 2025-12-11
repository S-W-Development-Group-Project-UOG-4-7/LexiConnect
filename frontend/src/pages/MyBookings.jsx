import Header from '../components/Header';
import './MyBookings.css';

const MyBookings = () => {
  const bookings = [
    {
      id: 1,
      lawyerName: 'Priya Jayawardena',
      status: 'Confirmed',
      date: '12/5/2025',
      time: '10:00',
      location: 'Colombo Main Office',
      token: '#5',
      reason: 'Contract review'
    }
  ];

  return (
    <div className="bookings-page">
      <div className="diamond-pattern"></div>
      <Header userName="Jane Smith" userRole="Client" />
      
      <main className="bookings-main">
        <div className="bookings-container">
          {/* Page Title */}
          <h1 className="bookings-page-title">My Bookings</h1>

          {/* Bookings List */}
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-lawyer-info">
                    <h3 className="booking-lawyer-name">{booking.lawyerName}</h3>
                    <span className={`badge ${booking.status === 'Confirmed' ? 'badge-success' : ''}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-row">
                    <div className="booking-detail-item">
                      <span className="booking-icon">📅</span>
                      <span className="booking-text">{booking.date}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="booking-icon">🕐</span>
                      <span className="booking-text">{booking.time}</span>
                    </div>
                  </div>

                  <div className="booking-detail-row">
                    <div className="booking-detail-item">
                      <span className="booking-icon">📍</span>
                      <span className="booking-text">{booking.location}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="booking-text">Token: {booking.token}</span>
                    </div>
                  </div>

                  <div className="booking-reason">
                    <span className="booking-text">Reason: {booking.reason}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button className="btn btn-primary upload-btn">
                    <span>📄</span>
                    <span>Upload Documents</span>
                  </button>
                  <button className="btn btn-danger cancel-btn">
                    <span>✕</span>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="no-bookings">
                <p className="no-bookings-text">You don't have any bookings yet.</p>
                <a href="/search" className="btn btn-primary">
                  Search Lawyers
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyBookings;

