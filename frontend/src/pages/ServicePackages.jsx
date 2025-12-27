import { useEffect, useState } from "react";
import "./availability-ui.css";

import {
  createServicePackage,
  deleteServicePackage,
  getMyServicePackages,
  updateServicePackage,
} from "../services/servicePackages";

function ServicePackages() {
  const [packages, setPackages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    active: true,
  });

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await getMyServicePackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load service packages. Make sure you are logged in as Lawyer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      duration: "",
      active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      duration: Number(form.duration),
      active: Boolean(form.active),
    };

    try {
      if (editingId) {
        // For PATCH you can send only changed fields,
        // but sending full payload is fine if your backend accepts it.
        await updateServicePackage(editingId, payload);
      } else {
        await createServicePackage(payload);
      }

      resetForm();
      await loadPackages();
    } catch (err) {
      console.error(err);
      alert("Failed to save service package. Check Swagger token + backend logs.");
    }
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name || "",
      description: pkg.description || "",
      price: pkg.price?.toString?.() ?? "",
      duration: pkg.duration?.toString?.() ?? "",
      active: !!pkg.active,
    });
  };

  const handleDelete = async (id) => {
    const ok = confirm("Delete this service package?");
    if (!ok) return;

    try {
      await deleteServicePackage(id);
      await loadPackages();
    } catch (err) {
      console.error(err);
      alert("Failed to delete service package.");
    }
  };

  const handleCancel = () => resetForm();

  return (
    <div className="availability-page">
      <div className="availability-card">
        <div className="availability-card-header">
          <div className="availability-brand">
            <span className="availability-logo">⚖️</span>
            <div className="availability-brand-text">
              <div className="availability-brand-name">LEXICONNECT</div>
              <div className="availability-brand-subtitle">Manage your service packages</div>
            </div>
          </div>
          <h1 className="availability-title">Service Packages</h1>
        </div>

        <form onSubmit={handleSubmit} className="availability-form">
          <div className="availability-form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Package Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter package name"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter package description"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price (LKR) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                className="form-control"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                Duration (Minutes) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Enter duration in minutes"
                className="form-control"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="active" className="form-label">
                Status
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.9rem", color: "rgba(226, 232, 240, 0.78)" }}>Active</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="availability-primary-btn" style={{ flex: 1 }}>
              {editingId ? "Save Changes" : "Add Package"}
            </button>
            {editingId && (
              <button type="button" className="availability-danger-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="availability-divider" />

        <div className="availability-section-header">
          <h2>Your Service Packages</h2>
          <p>Manage your existing service packages.</p>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="empty-state">
            <p>No service packages yet</p>
            <p className="empty-sub">Add your first service package to get started.</p>
          </div>
        ) : (
          <div className="availability-slots">
            {packages.map((pkg) => (
              <div key={pkg.id} className="slot-item">
                <div className="slot-info" style={{ flex: 1 }}>
                  <div className="slot-time">{pkg.name}</div>
                  <div className="slot-meta" style={{ marginTop: "0.25rem" }}>
                    {pkg.description}
                  </div>
                  <div className="slot-meta" style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span>LKR {Number(pkg.price).toLocaleString()}</span>
                    <span className="slot-sep">•</span>
                    <span>{pkg.duration} minutes</span>
                    <span className="slot-sep">•</span>
                    <span style={{ fontWeight: 600 }}>
                      {pkg.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="availability-primary-btn"
                    style={{ height: "40px", padding: "0 0.9rem", fontSize: "0.85rem" }}
                    onClick={() => handleEdit(pkg)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="availability-danger-btn"
                    onClick={() => handleDelete(pkg.id)}
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

export default ServicePackages;
