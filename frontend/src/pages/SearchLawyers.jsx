import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import './SearchLawyers.css';

const SearchLawyers = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    district: '',
    city: '',
    specialization: '',
    language: ''
  });
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLawyers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.district && filters.district !== 'All Districts') params.district = filters.district;
      if (filters.city) params.city = filters.city;
      if (filters.specialization && filters.specialization !== 'All Specializations') params.specialization = filters.specialization;
      if (filters.language && filters.language !== 'All Languages') params.language = filters.language;

      const response = await api.get('/api/v1/lawyers/search', { params });
      setLawyers(response.data);
    } catch (err) {
      setError('Failed to fetch lawyers. Please try again.');
      console.error('Error fetching lawyers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchLawyers();
  };

  const handleViewProfile = (lawyerId) => {
    navigate(`/lawyers/${lawyerId}`);
  };

  return (
    <div className="search-page">
      <div className="diamond-pattern"></div>
      <Header userName="Jane Smith" userRole="Client" />
      
      <main className="search-main">
        <div className="search-container">
          {/* Header Section */}
          <section className="search-header">
            <h1 className="search-title">Find a Lawyer</h1>
            <p className="search-description">
              Discover verified legal professionals tailored to your needs.
            </p>
          </section>

          {/* Filter Section */}
          <section className="filter-section">
            <div className="filter-header">
              <h3 className="filter-title">Filter Lawyers</h3>
              <span className="filter-arrow">▼</span>
            </div>
            <div className="filter-grid">
              <div className="filter-group">
                <label className="filter-label">District</label>
                <select
                  className="filter-select"
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                >
                  <option>All Districts</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">City</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Specialization</label>
                <select
                  className="filter-select"
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange('specialization', e.target.value)}
                >
                  <option>All Specializations</option>
                  <option>Corporate Law</option>
                  <option>Contract Law</option>
                  <option>Criminal Law</option>
                  <option>Family Law</option>
                  <option>Property Law</option>
                  <option>Tax Law</option>
                  <option>Immigration Law</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Language</label>
                <select
                  className="filter-select"
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                >
                  <option>All Languages</option>
                  <option>English</option>
                  <option>Sinhala</option>
                  <option>Tamil</option>
                </select>
              </div>
            </div>
            <div className="search-button-container">
              <button
                className="btn btn-primary search-btn"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </section>

          {/* Lawyers List */}
          <section className="lawyers-list">
            {loading && (
              <div className="loading-state">
                <p>Loading lawyers...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && lawyers.length === 0 && (
              <div className="empty-state">
                <p>No lawyers found</p>
              </div>
            )}

            {!loading && !error && lawyers.length > 0 && lawyers.map((lawyer) => (
              <div key={lawyer.id} className="lawyer-card">
                <div className="lawyer-avatar">
                  {lawyer.profile_image ? (
                    <img src={`http://localhost:8000/${lawyer.profile_image}`} alt="Profile" className="lawyer-avatar-icon" />
                  ) : (
                    <span className="lawyer-avatar-icon">👤</span>
                  )}
                </div>

                <div className="lawyer-info">
                  <div className="lawyer-header">
                    <div className="lawyer-name-group">
                      <h3 className="lawyer-name">{lawyer.name}</h3>
                    </div>
                  </div>

                  <p className="lawyer-degree">{lawyer.specialization}</p>

                  <div className="lawyer-details">
                    <div className="lawyer-detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="lawyer-detail-item">
                      <span className="detail-icon">⏰</span>
                      <span>{lawyer.experience_years} years experience</span>
                    </div>
                  </div>
                </div>

                <div className="lawyer-actions">
                  <button className="btn btn-secondary view-profile-btn" onClick={() => handleViewProfile(lawyer.id)}>
                    View Profile
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Footer */}
          <div className="search-footer">
            <p className="results-count">Showing {lawyers.length} of {lawyers.length} lawyers</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchLawyers;

