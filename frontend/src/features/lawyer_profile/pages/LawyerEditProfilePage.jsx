import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../pages/lawyer-ui.css";

const DEFAULT_PROFILE = {
  full_name: "Lawyer",
  email: "",
  phone: "",
  district: "",
  bio: "",
  experience_years: 0,
  specialization: "",
  languages: "",
  avatar_url: "",
};

export default function LawyerEditProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lawyer_profile");
    let profile = DEFAULT_PROFILE;
    if (stored) {
      try {
        profile = { ...profile, ...JSON.parse(stored) };
      } catch {
        profile = DEFAULT_PROFILE;
      }
    }
    const email = localStorage.getItem("email") || profile.email || "";
    setForm({ ...profile, email });
  }, []);

  const avatarPreview = useMemo(() => form.avatar_url?.trim(), [form.avatar_url]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!form.full_name.trim() || !form.district.trim() || !form.bio.trim()) {
      setError("Full name, district, and bio are required.");
      return;
    }

    const payload = {
      ...form,
      experience_years: Number(form.experience_years) || 0,
    };

    localStorage.setItem("lawyer_profile", JSON.stringify(payload));
    setSaved(true);
  };

  return (
    <div className="lc-page">
      <div className="lc-card">
        <div className="lc-header">
          <div className="lc-icon">EP</div>
          <div>
            <h1 className="lc-title">Edit Profile</h1>
            <p className="lc-subtitle">Update your professional details visible to clients</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}
        {saved && (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            Profile updated.
          </div>
        )}

        <form onSubmit={handleSave} className="availability-form">
          <div className="lc-form-grid">
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="lc-input"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                className="lc-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="lc-input"
                placeholder="+94 77 123 4567"
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
                className="lc-input"
                placeholder="e.g., Colombo"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="bio" className="form-label">
                Bio <span className="required-star">*</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="lc-textarea"
                maxLength={500}
                placeholder="Share your professional background and focus areas"
                required
              />
              <div className="field-hint">{form.bio.length}/500</div>
            </div>

            <div className="form-group">
              <label htmlFor="experience_years" className="form-label">
                Experience (years)
              </label>
              <input
                type="number"
                id="experience_years"
                name="experience_years"
                value={form.experience_years}
                onChange={handleChange}
                className="lc-input"
                min="0"
                placeholder="e.g., 5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialization" className="form-label">
                Specialization
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                className="lc-input"
                placeholder="e.g., Corporate Law"
              />
            </div>

            <div className="form-group">
              <label htmlFor="languages" className="form-label">
                Languages
              </label>
              <input
                type="text"
                id="languages"
                name="languages"
                value={form.languages}
                onChange={handleChange}
                className="lc-input"
                placeholder="English, Sinhala, Tamil"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="avatar_url" className="form-label">
                Avatar URL
              </label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input
                  type="text"
                  id="avatar_url"
                  name="avatar_url"
                  value={form.avatar_url}
                  onChange={handleChange}
                  className="lc-input"
                  placeholder="https://..."
                />
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    border: "1px solid rgba(242, 184, 75, 0.35)",
                    background: "rgba(242, 184, 75, 0.12)",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: "0.9rem", color: "rgba(242, 184, 75, 0.9)" }}>
                      Preview
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="dash-action-btn"
              onClick={() => navigate("/lawyer/dashboard")}
            >
              Cancel
            </button>
            <button type="submit" className="lc-primary-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
