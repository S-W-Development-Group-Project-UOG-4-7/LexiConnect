import { useState } from "react";
import './availability-ui.css';

function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    name: "",
    district: "",
    city: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBranch = {
      id: Date.now(),
      name: form.name,
      district: form.district,
      city: form.city,
      address: form.address,
    };
    setBranches([...branches, newBranch]);
    setForm({
      name: "",
      district: "",
      city: "",
      address: "",
    });
  };

  return (
    <div className="availability-page">
      <div className="availability-card">
        <div className="availability-card-header">
          <div className="availability-brand">
            <span className="availability-logo">⚖️</span>
            <div className="availability-brand-text">
              <div className="availability-brand-name">LEXICONNECT</div>
              <div className="availability-brand-subtitle">Manage your branch locations</div>
            </div>
          </div>
          <h1 className="availability-title">My Branches</h1>
        </div>

        <form onSubmit={handleSubmit} className="availability-form">
          <div className="availability-form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Branch Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter branch name"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="district" className="form-label">
                District <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Enter district"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Address <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter full address"
                className="form-control"
              />
            </div>
          </div>

          <button type="submit" className="availability-primary-btn">
            Add Branch
          </button>
        </form>

        <div className="availability-divider" />

        <div className="availability-section-header">
          <h2>Your Branches</h2>
          <p>Manage your existing branch locations.</p>
        </div>

        {branches.length === 0 ? (
          <div className="empty-state">
            <p>No branches yet</p>
            <p className="empty-sub">Add your first branch to get started.</p>
            <button 
              type="button"
              className="availability-primary-btn"
              style={{ marginTop: '1rem' }}
              onClick={() => {}}
            >
              Add First Branch
            </button>
          </div>
        ) : (
          <div className="availability-slots">
            {branches.map(b => (
              <div key={b.id} className="slot-item">
                <div className="slot-info">
                  <div className="slot-time">{b.name}</div>
                  <div className="slot-meta">
                    <span>{b.city}</span>
                    {b.district && (
                      <>
                        <span className="slot-sep">•</span>
                        <span>{b.district}</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="availability-primary-btn"
                    style={{ height: '40px', padding: '0 0.9rem', fontSize: '0.85rem' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="availability-danger-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BranchManagement;
