import { useEffect, useMemo, useState } from "react";
import "./lawyer-ui.css";
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
    <div className="">
      <div className="lc-card">
        <div className="lc-header">
          <div className="lc-icon">📍</div>
          <div>
            <h1 className="lc-title">My Branches</h1>
            <p className="lc-subtitle">Manage your branch locations</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="availability-form">
          <div className="lc-form-grid">
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
                placeholder="e.g., Main Office"
                className="lc-input"
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
                placeholder="e.g., Colombo"
                className="lc-input"
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
                placeholder="e.g., Colombo 03"
                className="lc-input"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="address" className="form-label">
                Full Address <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g., No. 123, Galle Road"
                className="lc-input"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            {isEditing && (
              <button
                type="button"
                className="availability-danger-btn"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="lc-primary-btn"
              disabled={submitting}
            >
              <span>+</span>
              {submitting
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                ? "Save Changes"
                : "Add Branch"}
            </button>
          </div>
        </form>

        <div className="lc-divider" />

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
              className="lc-primary-btn"
              style={{ marginTop: "1rem" }}
              onClick={() => {
                const el = document.getElementById("name");
                if (el) el.focus();
              }}
            >
              <span>+</span>
              Add First Branch
            </button>
          </div>
        ) : (
          <div className="lc-list">
            {branches.map((b) => (
              <div key={b.id} className="lc-list-card">
                <div className="lc-list-card-content">
                  <div className="lc-list-card-title">{b.name}</div>
                  <div className="lc-list-card-meta">
                    {b.city}
                    {b.district && `, ${b.district}`}
                  </div>
                  {b.address && (
                    <div className="lc-list-card-meta" style={{ marginTop: "0.25rem" }}>
                      {b.address}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="lc-icon-btn edit"
                    onClick={() => handleEdit(b)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="lc-icon-btn delete"
                    onClick={() => handleDelete(b.id)}
                    title="Delete"
                  >
                    🗑️
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