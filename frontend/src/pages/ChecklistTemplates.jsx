import { useEffect, useState } from "react";
import "./availability-ui.css";
import { checklistTemplatesApi } from "../services/checklistTemplates";

function ChecklistTemplates() {
  const [checklists, setChecklists] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    question: "",
    helperText: "",
    required: false,
  });

  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await checklistTemplatesApi.listMine();
      // backend returns helper_text, convert for UI
      const mapped = (data || []).map((t) => ({
        id: t.id,
        question: t.question,
        helperText: t.helper_text ?? "",
        required: t.required,
        created_at: t.created_at,
      }));
      setChecklists(mapped);
    } catch (e) {
      setError(e.message || "Failed to load checklist templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      question: form.question,
      helper_text: form.helperText || null,
      required: form.required,
    };

    try {
      if (editingId) {
        await checklistTemplatesApi.update(editingId, payload);
        setEditingId(null);
      } else {
        await checklistTemplatesApi.create(payload);
      }

      setForm({ question: "", helperText: "", required: false });
      await loadTemplates();
    } catch (e) {
      setError(e.message || "Save failed");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      helperText: item.helperText || "",
      required: item.required,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ question: "", helperText: "", required: false });
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await checklistTemplatesApi.remove(id);
      await loadTemplates();
    } catch (e) {
      setError(e.message || "Delete failed");
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
                Manage your checklist templates
              </div>
            </div>
          </div>
          <h1 className="availability-title">Checklist Templates</h1>
        </div>

        {error && (
          <div style={{ marginBottom: "1rem", color: "rgba(248,113,113,0.95)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="availability-form">
          <div className="availability-form-grid">
            <div className="form-group">
              <label htmlFor="question" className="form-label">
                Checklist Question <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={form.question}
                onChange={handleChange}
                placeholder="Enter checklist question"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="helperText" className="form-label">
                Helper Text
              </label>
              <input
                type="text"
                id="helperText"
                name="helperText"
                value={form.helperText}
                onChange={handleChange}
                placeholder="Enter optional helper text"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="required" className="form-label">
                Required
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  checked={form.required}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.9rem", color: "rgba(226, 232, 240, 0.78)" }}>
                  Mark as required
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="availability-primary-btn" style={{ flex: 1 }}>
              {editingId ? "Save Changes" : "Add Checklist Item"}
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
          <h2>Your Checklist Templates</h2>
          <p>Manage your existing checklist items.</p>
        </div>

        <button
          type="button"
          className="availability-primary-btn"
          style={{ marginBottom: "1rem" }}
          onClick={loadTemplates}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        {checklists.length === 0 ? (
          <div className="empty-state">
            <p>{loading ? "Loading..." : "You haven't created any checklist templates yet."}</p>
            {!loading && (
              <button
                type="button"
                className="availability-primary-btn"
                style={{ marginTop: "1rem" }}
                onClick={() => {}}
              >
                Add First Checklist Item
              </button>
            )}
          </div>
        ) : (
          <div className="availability-slots">
            {checklists.map((item) => (
              <div key={item.id} className="slot-item">
                <div className="slot-info" style={{ flex: 1 }}>
                  <div className="slot-time">{item.question}</div>
                  {item.helperText && (
                    <div className="slot-meta" style={{ marginTop: "0.25rem" }}>
                      {item.helperText}
                    </div>
                  )}
                  <div className="slot-meta" style={{ marginTop: "0.5rem" }}>
                    {item.required && <span className="slot-badge">Required</span>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="availability-primary-btn"
                    style={{ height: "40px", padding: "0 0.9rem", fontSize: "0.85rem" }}
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="availability-danger-btn"
                    onClick={() => handleDelete(item.id)}
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

export default ChecklistTemplates;
