import { useState } from "react";
import './availability-ui.css';

function ChecklistTemplates() {
  const [checklists, setChecklists] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    question: "",
    helperText: "",
    required: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setChecklists(checklists.map(item => 
        item.id === editingId 
          ? { ...item, ...form }
          : item
      ));
      setEditingId(null);
    } else {
      const newChecklist = {
        id: Date.now(),
        question: form.question,
        helperText: form.helperText,
        required: form.required,
      };
      setChecklists([...checklists, newChecklist]);
    }
    setForm({
      question: "",
      helperText: "",
      required: false,
    });
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
    setForm({
      question: "",
      helperText: "",
      required: false,
    });
  };

  const handleDelete = (id) => {
    setChecklists(checklists.filter(item => item.id !== id));
  };

  return (
    <div className="availability-page">
      <div className="availability-card">
        <div className="availability-card-header">
          <div className="availability-brand">
            <span className="availability-logo">⚖️</span>
            <div className="availability-brand-text">
              <div className="availability-brand-name">LEXICONNECT</div>
              <div className="availability-brand-subtitle">Manage your checklist templates</div>
            </div>
          </div>
          <h1 className="availability-title">Checklist Templates</h1>
        </div>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  checked={form.required}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'rgba(226, 232, 240, 0.78)' }}>Mark as required</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="availability-primary-btn" style={{ flex: 1 }}>
              {editingId ? 'Save Changes' : 'Add Checklist Item'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="availability-danger-btn"
                onClick={handleCancel}
              >
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

        {checklists.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any checklist templates yet.</p>
            <button 
              type="button"
              className="availability-primary-btn"
              style={{ marginTop: '1rem' }}
              onClick={() => {}}
            >
              Add First Checklist Item
            </button>
          </div>
        ) : (
          <div className="availability-slots">
            {checklists.map(item => (
              <div key={item.id} className="slot-item">
                <div className="slot-info" style={{ flex: 1 }}>
                  <div className="slot-time">{item.question}</div>
                  {item.helperText && (
                    <div className="slot-meta" style={{ marginTop: '0.25rem' }}>
                      {item.helperText}
                    </div>
                  )}
                  <div className="slot-meta" style={{ marginTop: '0.5rem' }}>
                    {item.required && (
                      <span className="slot-badge">Required</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="availability-primary-btn"
                    style={{ height: '40px', padding: '0 0.9rem', fontSize: '0.85rem' }}
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

