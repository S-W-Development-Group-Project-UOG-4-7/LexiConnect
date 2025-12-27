import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./SearchLawyers.css";

const SearchLawyers = () => {
  const [filters, setFilters] = useState({
    district: "All Districts",
    city: "",
    specialization: "All Specializations",
    language: "All Languages",
  });

  const lawyers = [
    {
      id: 1,
      name: "Priya Jayawardena",
      verified: true,
      degree: "LLB (Hons), Attorney-at-Law",
      rating: 4.8,
      reviews: 45,
      specializations: ["Corporate Law", "Contract Law"],
      location: { city: "Colombo", district: "Colombo" },
      languages: ["English", "Sinhala", "Tamil"],
      image: "👩‍💼",
    },
    {
      id: 2,
      name: "Rohan Perera",
      verified: true,
      degree: "LLB, LLM",
      rating: 4.6,
      reviews: 32,
      specializations: ["Criminal Law", "Family Law"],
      location: { city: "Kandy", district: "Kandy" },
      languages: ["English", "Sinhala"],
      image: "👨‍💼",
    },
    {
      id: 3,
      name: "Nimalka Fernando",
      verified: true,
      degree: "LLB (Hons), Attorney-at-Law",
      rating: 4.9,
      reviews: 56,
      specializations: ["Property Law", "Tax Law"],
      location: { city: "Galle", district: "Galle" },
      languages: ["English", "Sinhala", "Tamil"],
      image: "👩‍💼",
    },
    {
      id: 4,
      name: "Arjun Silva",
      verified: false,
      degree: "LLB",
      rating: 4.7,
      reviews: 25,
      specializations: ["Immigration Law", "Corporate Law"],
      location: { city: "Nugegoda", district: "Colombo" },
      languages: ["English"],
      image: "👨‍💼",
    },
  ];

  const filtered = useMemo(() => {
    return lawyers.filter((l) => {
      const districtOk =
        filters.district === "All Districts" ||
        l.location.district === filters.district;

      const cityOk =
        !filters.city.trim() ||
        l.location.city.toLowerCase().includes(filters.city.trim().toLowerCase());

      const specOk =
        filters.specialization === "All Specializations" ||
        l.specializations.includes(filters.specialization);

      const langOk =
        filters.language === "All Languages" || l.languages.includes(filters.language);

      return districtOk && cityOk && specOk && langOk;
    });
  }, [filters, lawyers]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="search-page">
      <div className="diamond-pattern"></div>

      <main className="search-main">
        <div className="search-container">
          <section className="search-header">
            <h1 className="search-title">FIND LEGAL EXPERTS</h1>
            <h2 className="search-subtitle">Search Lawyers</h2>
            <p className="search-description">
              Discover verified legal professionals tailored to your needs.
            </p>
          </section>

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
                  onChange={(e) => handleFilterChange("district", e.target.value)}
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
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Specialization</label>
                <select
                  className="filter-select"
                  value={filters.specialization}
                  onChange={(e) =>
                    handleFilterChange("specialization", e.target.value)
                  }
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
                  onChange={(e) => handleFilterChange("language", e.target.value)}
                >
                  <option>All Languages</option>
                  <option>English</option>
                  <option>Sinhala</option>
                  <option>Tamil</option>
                </select>
              </div>
            </div>
          </section>

          <section className="lawyers-list">
            {filtered.map((lawyer) => (
              <div key={lawyer.id} className="lawyer-card">
                <div className="lawyer-avatar">
                  <span className="lawyer-avatar-icon">{lawyer.image}</span>
                </div>

                <div className="lawyer-info">
                  <div className="lawyer-header">
                    <div className="lawyer-name-group">
                      <h3 className="lawyer-name">{lawyer.name}</h3>
                      {lawyer.verified && (
                        <span className="badge badge-verified">Verified</span>
                      )}
                    </div>
                  </div>

                  <p className="lawyer-degree">{lawyer.degree}</p>

                  <div className="lawyer-rating">
                    <span className="rating-stars">★</span>
                    <span className="rating-value">{lawyer.rating}</span>
                    <span className="rating-reviews">
                      ({lawyer.reviews} reviews)
                    </span>
                  </div>

                  <div className="lawyer-specializations">
                    {lawyer.specializations.map((spec, idx) => (
                      <span key={idx} className="specialization-tag">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="lawyer-details">
                    <div className="lawyer-detail-item">
                      <span className="detail-icon">📍</span>
                      <span>
                        {lawyer.location.city}, {lawyer.location.district}
                      </span>
                    </div>
                    <div className="lawyer-detail-item">
                      <span className="detail-icon">🗣️</span>
                      <span>{lawyer.languages.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="lawyer-actions">
                  <Link
                    to={`/client/profile/${lawyer.id}`}
                    className="btn btn-secondary view-profile-btn"
                  >
                    View Profile <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </section>

          <div className="search-footer">
            <p className="results-count">
              Showing {filtered.length} of {lawyers.length} lawyers
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchLawyers;
