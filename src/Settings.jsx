import { useEffect, useState } from "react";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const [settings, setSettings] = useState({
    name: "Shivani",
    email: "shivani@example.com",
    phone: "",
    businessName: "My Business",
    website: "",
    timezone: "Asia/Kolkata",
    emailNotifications: true,
    leadNotifications: true,
    followUpNotifications: true,
    invoiceNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("businessOSSettings");

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Settings load error:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "businessOSSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const resetSettings = () => {
    const defaultSettings = {
      name: "Shivani",
      email: "shivani@example.com",
      phone: "",
      businessName: "My Business",
      website: "",
      timezone: "Asia/Kolkata",
      emailNotifications: true,
      leadNotifications: true,
      followUpNotifications: true,
      invoiceNotifications: true,
    };

    setSettings(defaultSettings);

    localStorage.setItem(
      "businessOSSettings",
      JSON.stringify(defaultSettings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const tabs = [
    {
      id: "profile",
      icon: "♙",
      label: "Profile",
    },
    {
      id: "business",
      icon: "▣",
      label: "Business",
    },
    {
      id: "notifications",
      icon: "♢",
      label: "Notifications",
    },
    {
      id: "security",
      icon: "◇",
      label: "Security",
    },
  ];

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-header">

        <div>
          <div className="settings-title-row">
            <div className="settings-title-icon">
              ⚙
            </div>

            <div>
              <h1>Settings</h1>

              <p>
                Manage your Business OS preferences and account settings.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-header-actions">

          {saved && (
            <span className="settings-saved">
              ✓ Settings saved
            </span>
          )}

          <button
            className="settings-reset-button"
            onClick={resetSettings}
          >
            Reset
          </button>

          <button
            className="settings-save-button"
            onClick={saveSettings}
          >
            ✓ Save Changes
          </button>

        </div>

      </div>

      {/* SETTINGS LAYOUT */}

      <div className="settings-layout">

        {/* LEFT TABS */}

        <aside className="settings-sidebar">

          <div className="settings-sidebar-title">
            SETTINGS
          </div>

          {tabs.map((tab) => (

            <button
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "settings-tab active"
                  : "settings-tab"
              }
              onClick={() =>
                setActiveTab(tab.id)
              }
            >

              <span className="settings-tab-icon">
                {tab.icon}
              </span>

              <span>
                {tab.label}
              </span>

              {activeTab === tab.id && (
                <span className="settings-tab-arrow">
                  →
                </span>
              )}

            </button>

          ))}

        </aside>

        {/* CONTENT */}

        <section className="settings-content">

          {/* PROFILE */}

          {activeTab === "profile" && (

            <div className="settings-card">

              <div className="settings-card-header">

                <div>
                  <h2>Profile Settings</h2>

                  <p>
                    Update your personal information.
                  </p>
                </div>

                <div className="profile-large-avatar">
                  {String(settings.name || "S")
                    .charAt(0)
                    .toUpperCase()}
                </div>

              </div>

              <div className="settings-divider"></div>

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={settings.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Timezone
                  </label>

                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                  >
                    <option value="Asia/Kolkata">
                      India (IST)
                    </option>

                    <option value="America/New_York">
                      United States (Eastern)
                    </option>

                    <option value="America/Los_Angeles">
                      United States (Pacific)
                    </option>

                    <option value="Europe/London">
                      United Kingdom
                    </option>

                    <option value="Europe/Amsterdam">
                      Netherlands
                    </option>
                  </select>

                </div>

              </div>

            </div>

          )}

          {/* BUSINESS */}

          {activeTab === "business" && (

            <div className="settings-card">

              <div className="settings-card-header">

                <div>
                  <h2>Business Information</h2>

                  <p>
                    Configure your business details.
                  </p>
                </div>

                <div className="business-settings-icon">
                  ◈
                </div>

              </div>

              <div className="settings-divider"></div>

              <div className="settings-form">

                <div className="settings-field">

                  <label>
                    Business Name
                  </label>

                  <input
                    type="text"
                    name="businessName"
                    value={settings.businessName}
                    onChange={handleChange}
                    placeholder="Your business name"
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Website
                  </label>

                  <input
                    type="text"
                    name="website"
                    value={settings.website}
                    onChange={handleChange}
                    placeholder="https://yourbusiness.com"
                  />

                </div>

              </div>

              <div className="settings-info-box">

                <span>
                  ✦
                </span>

                <div>
                  <strong>
                    Business OS
                  </strong>

                  <p>
                    These details can be used across your
                    dashboard, reports and AI Assistant.
                  </p>
                </div>

              </div>

            </div>

          )}

          {/* NOTIFICATIONS */}

          {activeTab === "notifications" && (

            <div className="settings-card">

              <div className="settings-card-header">

                <div>
                  <h2>Notifications</h2>

                  <p>
                    Choose which notifications you want to receive.
                  </p>
                </div>

                <div className="notification-settings-icon">
                  ♢
                </div>

              </div>

              <div className="settings-divider"></div>

              <div className="notification-list">

                <div className="notification-item">

                  <div>
                    <strong>
                      Email Notifications
                    </strong>

                    <p>
                      Receive important Business OS updates by email.
                    </p>
                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                    />

                    <span></span>

                  </label>

                </div>

                <div className="notification-item">

                  <div>
                    <strong>
                      New Lead Alerts
                    </strong>

                    <p>
                      Get notified when a new lead is added.
                    </p>
                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      name="leadNotifications"
                      checked={settings.leadNotifications}
                      onChange={handleChange}
                    />

                    <span></span>

                  </label>

                </div>

                <div className="notification-item">

                  <div>
                    <strong>
                      Follow-up Reminders
                    </strong>

                    <p>
                      Receive reminders for upcoming follow-ups.
                    </p>
                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      name="followUpNotifications"
                      checked={settings.followUpNotifications}
                      onChange={handleChange}
                    />

                    <span></span>

                  </label>

                </div>

                <div className="notification-item">

                  <div>
                    <strong>
                      Invoice Notifications
                    </strong>

                    <p>
                      Get alerts for pending and overdue invoices.
                    </p>
                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      name="invoiceNotifications"
                      checked={settings.invoiceNotifications}
                      onChange={handleChange}
                    />

                    <span></span>

                  </label>

                </div>

              </div>

            </div>

          )}

          {/* SECURITY */}

          {activeTab === "security" && (

            <div className="settings-card">

              <div className="settings-card-header">

                <div>
                  <h2>Security</h2>

                  <p>
                    Manage your account security.
                  </p>
                </div>

                <div className="security-settings-icon">
                  🔐
                </div>

              </div>

              <div className="settings-divider"></div>

              <div className="security-status">

                <div className="security-status-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Account Protected
                  </strong>

                  <p>
                    Your Business OS account is currently active.
                  </p>
                </div>

                <span className="security-active">
                  Active
                </span>

              </div>

              <div className="security-option">

                <div>
                  <strong>
                    Password
                  </strong>

                  <p>
                    Keep your account protected with a strong password.
                  </p>
                </div>

                <button
                  className="security-button"
                  onClick={() =>
                    alert("Password management will be connected to Firebase Authentication.")
                  }
                >
                  Manage Password
                </button>

              </div>

              <div className="security-option">

                <div>
                  <strong>
                    Two-Factor Authentication
                  </strong>

                  <p>
                    Add an additional layer of protection to your account.
                  </p>
                </div>

                <button
                  className="security-button"
                  onClick={() =>
                    alert("Two-factor authentication can be enabled when Firebase Authentication is connected.")
                  }
                >
                  Enable 2FA
                </button>

              </div>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default Settings;