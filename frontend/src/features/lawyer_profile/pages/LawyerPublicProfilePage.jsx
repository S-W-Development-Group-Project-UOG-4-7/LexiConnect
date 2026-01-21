import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../../pages/lawyer-ui.css";

export default function LawyerPublicProfilePage() {
  const navigate = useNavigate();
  const stored = localStorage.getItem("lawyer_profile");
  let profile = null;

  if (stored) {
    try {
      profile = JSON.parse(stored);
    } catch {
      profile = null;
    }
  }

  const initials = useMemo(() => {
    const name = profile?.full_name || "Lawyer";
    const parts = name.split(" ").filter(Boolean);
    const first = parts[0]?.charAt(0) || "L";
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
    return `${first}${last}`.toUpperCase();
  }, [profile?.full_name]);

  if (!profile) {
    return (
      <div className="lc-page">
        <div className="lc-card">
          <div className="lc-header">
            <div className="lc-icon">PP</div>
            <div>
              <h1 className="lc-title">Public Profile</h1>
              <p className="lc-subtitle">This is how clients will see you</p>
            </div>
          </div>
          <div className="empty-state">
            <p>No profile created yet</p>
            <p className="empty-sub">Create your public profile to start attracting clients.</p>
            <button
              type="button"
              className="lc-primary-btn"
              style={{ marginTop: "1rem" }}
              onClick={() => navigate("/lawyer/profile/edit")}
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const languages = (profile.languages || "")
    .split(",")
    .map((lang) => lang.trim())
    .filter(Boolean);

  return (
    <div className="lc-page">
      <div className="lc-card">
        <div className="lc-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="lc-icon">PP</div>
            <div>
              <h1 className="lc-title">Public Profile</h1>
              <p className="lc-subtitle">This is how clients will see you</p>
            </div>
          </div>
          <button
            type="button"
            className="lc-primary-btn"
            onClick={() => navigate("/lawyer/profile/edit")}
          >
            Edit Profile
          </button>
        </div>

        <div className="lc-list-card" style={{ alignItems: "flex-start" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              border: "1px solid rgba(242, 184, 75, 0.35)",
              background: "rgba(242, 184, 75, 0.12)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Lawyer"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "rgba(242, 184, 75, 0.95)" }}>
                {initials}
              </span>
            )}
          </div>
          <div className="lc-list-card-content" style={{ marginLeft: "1rem" }}>
            <div className="lc-list-card-title">{profile.full_name || "Lawyer"}</div>
            <div className="lc-list-card-meta">District: {profile.district || "Not provided"}</div>
            <div className="lc-list-card-meta">
              Specialization: {profile.specialization || "Not specified"}
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <span className="lc-badge amber">
                {profile.experience_years || 0} Years Experience
              </span>
            </div>
          </div>
        </div>

        <div className="lc-divider" />

        <div className="availability-section-header">
          <h2>Languages</h2>
          <p>Communication preferences</p>
        </div>
        {languages.length === 0 ? (
          <div className="empty-state">
            <p>No languages added</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {languages.map((lang) => (
              <span key={lang} className="lc-chip pending">
                {lang}
              </span>
            ))}
          </div>
        )}

        <div className="lc-divider" />

        <div className="availability-section-header">
          <h2>Bio</h2>
          <p>Professional summary</p>
        </div>
        <div className="lc-list-card" style={{ alignItems: "flex-start" }}>
          <div className="lc-list-card-content">
            <div className="lc-list-card-meta" style={{ fontSize: "0.95rem" }}>
              {profile.bio || "No bio provided."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
