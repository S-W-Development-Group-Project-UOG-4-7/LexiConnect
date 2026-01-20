import { useEffect, useState } from "react";
import "../../../pages/lawyer-ui.css";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  smsNotifications: false,
  publicProfileVisible: true,
};

export default function LawyerSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem("lawyer_settings");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const updateSetting = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    localStorage.setItem("lawyer_settings", JSON.stringify(next));
  };

  return (
    <div className="lc-page">
      <div className="lc-card">
        <div className="lc-header">
          <div className="lc-icon">ST</div>
          <div>
            <h1 className="lc-title">Settings</h1>
            <p className="lc-subtitle">Manage your preferences</p>
          </div>
        </div>

        <div className="lc-list">
          <div className="lc-list-card">
            <div className="lc-list-card-content">
              <div className="lc-list-card-title">Email notifications</div>
              <div className="lc-list-card-meta">Product updates, booking alerts, and reminders.</div>
            </div>
            <button
              type="button"
              className={`lc-toggle ${settings.emailNotifications ? "active" : ""}`}
              onClick={() => updateSetting("emailNotifications")}
              aria-pressed={settings.emailNotifications}
            />
          </div>

          <div className="lc-list-card">
            <div className="lc-list-card-content">
              <div className="lc-list-card-title">SMS notifications</div>
              <div className="lc-list-card-meta">Urgent updates for bookings and requests.</div>
            </div>
            <button
              type="button"
              className={`lc-toggle ${settings.smsNotifications ? "active" : ""}`}
              onClick={() => updateSetting("smsNotifications")}
              aria-pressed={settings.smsNotifications}
            />
          </div>

          <div className="lc-list-card">
            <div className="lc-list-card-content">
              <div className="lc-list-card-title">Public profile visible</div>
              <div className="lc-list-card-meta">Allow clients to view your public profile.</div>
            </div>
            <button
              type="button"
              className={`lc-toggle ${settings.publicProfileVisible ? "active" : ""}`}
              onClick={() => updateSetting("publicProfileVisible")}
              aria-pressed={settings.publicProfileVisible}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
