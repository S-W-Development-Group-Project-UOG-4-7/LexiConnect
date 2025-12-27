import { useEffect, useMemo, useState } from "react";
import "./availability-ui.css";
import api from "../services/api"; // ✅ uses env base URL + attaches token

function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    name: "",
    district: "",
    city: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const resetForm = () => {
    setForm({ name: "", district: "", city: "", address: "" });
    setEditingId(null);
  };

  const fetchBranches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/branches/me");
      setBranches(res.data || []);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load branches.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!form.name || !form.district || !form.city || !form.address) {
        setError("Please fill all required fields.");
        return;
      }

      if (isEditing) {
        // ✅ Update branch
        const res = await api.patch(`/api/branches/${editingId}`, form);

        // update local list without refetch
        setBranches((prev) =>
          prev.map((b) => (b.id === editingId ? res.data : b))
        );
      } else {
        // ✅ Create branch
        const res = await api.post("/api/branches", form);
        setBranches((prev) => [...prev, res.data]);
      }

      resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to save branch.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name || "",
      district: branch.district || "",
      city: branch.city || "",
      address: branch.address || "",
    });
    setError("");
  };

  const handleDelete = async (branchId) => {
    const ok = window.confirm("Delete this branch?");
    if (!ok) return;

    setError("");
    try {
      await api.delete(`/api/branches/${branchId}`);
      setBranches((prev) => prev.filter((b) => b.id !== branchId));

      // if deleting the branch you're editing, reset
      if (editingId === branchId) resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to delete branch.";
      setError(msg);
    }
  };

  return (
    <div className="availability-page">
      <div className="availability-card">
        <div className="availability-card-header">
          <div className="availability-brand">
            <span className="availability-logo">⚖️</span>
            <div className="availability-brand-text">
              <div className="availability-brand-name">LEXICONNECT</div>
              <div className="availability-brand-subtitle">
                Manage your branch locations
              </div>
            </div>
          </div>
          <h1 className="availability-title">My Branches</h1>
        </div>

        {/* Error banner */}
        {error ? (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              marginBottom: "1rem",
              border: "1px solid rgba(255,0,0,0.25)",
              background: "rgba(255,0,0,0.06)",
              fontSize: "0.95rem",
            }}
          >
            {error}
          </div>
        ) : null}

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

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="submit"
              className="availability-primary-btn"
              disabled={submitting}
            >
              {submitting
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                ? "Save Changes"
                : "Add Branch"}
            </button>

            {isEditing ? (
              <button
                type="button"
                className="availability-danger-btn"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="availability-divider" />

        <div className="availability-section-header">
          <h2>Your Branches</h2>
          <p>Manage your existing branch locations.</p>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading branches...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="empty-state">
            <p>No branches yet</p>
            <p className="empty-sub">Add your first branch to get started.</p>
            <button
              type="button"
              className="availability-primary-btn"
              style={{ marginTop: "1rem" }}
              onClick={() => {
                // focus the first field
                const el = document.getElementById("name");
                if (el) el.focus();
              }}
            >
              Add First Branch
            </button>
          </div>
        ) : (
          <div className="availability-slots">
            {branches.map((b) => (
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
                  {b.address ? (
                    <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>
                      {b.address}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="availability-primary-btn"
                    style={{
                      height: "40px",
                      padding: "0 0.9rem",
                      fontSize: "0.85rem",
                    }}
                    onClick={() => handleEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="availability-danger-btn"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick refresh link */}
        <div style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="availability-primary-btn"
            style={{ height: "40px", padding: "0 0.9rem", fontSize: "0.85rem" }}
            onClick={fetchBranches}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default BranchManagement;
