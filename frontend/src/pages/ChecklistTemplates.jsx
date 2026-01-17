import { useEffect, useState } from "react";
import "./lawyer-ui.css";
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
    <div className="lc-page">
      <div className="lc-card">
        <div className="lc-header">
          <div className="lc-icon">✓</div>
          <div>
            <h1 className="lc-title">Checklist Templates</h1>
            <p className="lc-subtitle">Manage your legal checklist templates</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="availability-form">
          <div className="lc-form-grid full-width">
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
                placeholder="e.g., What is the nature of your legal issue?"
                className="lc-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="helperText" className="form-label">
                Helper Text (Optional)
              </label>
              <input
                type="text"
                id="helperText"
                name="helperText"
                value={form.helperText}
                onChange={handleChange}
                placeholder="Additional context or instructions for the question"
                className="lc-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="required" className="form-label">
                Required
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  checked={form.required}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.9rem", color: "rgba(226, 232, 240, 0.78)" }}>
                  Required field
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            {editingId && (
              <button type="button" className="availability-danger-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="lc-primary-btn">
              <span>+</span>
              {editingId ? "Save Changes" : "Add Checklist Item"}
            </button>
          </div>
        </form>

        <div className="lc-divider" />

        <div className="availability-section-header">
          <h2>Your Checklist Templates</h2>
          <p>Manage your existing checklist items.</p>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading...</p>
          </div>
        ) : checklists.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any checklist templates yet.</p>
            <button
              type="button"
              className="lc-primary-btn"
              style={{ marginTop: "1rem" }}
              onClick={() => {}}
            >
              <span>+</span>
              Add First Checklist Item
            </button>
          </div>
        ) : (
          <div className="lc-list">
            {checklists.map((item) => (
              <div key={item.id} className="lc-list-card">
                <div className="lc-list-card-content">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div className="lc-list-card-title" style={{ margin: 0 }}>{item.question}</div>
                    {item.required && (
                      <span className="lc-badge amber">Required</span>
                    )}
                  </div>
                  {item.helperText && (
                    <div className="lc-list-card-meta">
                      {item.helperText}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="lc-icon-btn edit"
                    onClick={() => handleEdit(item)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="lc-icon-btn delete"
                    onClick={() => handleDelete(item.id)}
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

export default ChecklistTemplates;