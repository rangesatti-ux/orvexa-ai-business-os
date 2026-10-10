
import { useEffect, useState } from "react";
import {
  Save,
  User,
  Bell,
  Lock,
  Globe,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const defaultSettings = {
  companyName: "Orvexa AI",
  email: "admin@orvexa.ai",
  language: "English",
  notifications: true,
};

function Settings() {
  const { darkMode } = useTheme();

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("orvexaSettings") || "{}"
      );

      setSettings({ ...defaultSettings, ...saved });
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!settings.companyName.trim() || !settings.email.trim()) {
      toast.error("Company name and email are required.");
      return;
    }

    try {
      localStorage.setItem("orvexaSettings", JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Unable to save settings in this browser.");
    }
  };

  const cardClass = `rounded-xl border p-5 shadow-sm transition-colors duration-200 sm:p-6 ${
    darkMode
      ? "border-slate-700 bg-slate-800 text-slate-100"
      : "border-gray-200 bg-white text-gray-900"
  }`;

  const inputClass = `mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
    darkMode
      ? "border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-400"
      : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
  }`;

  const mutedText = darkMode ? "text-slate-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";

  const iconBox = darkMode
    ? "bg-blue-500/10 text-blue-400"
    : "bg-blue-50 text-blue-600";

  return (
    <div
      className={`min-h-full p-4 transition-colors duration-200 sm:p-6 lg:p-8 ${
        darkMode
          ? "bg-slate-900 text-slate-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${headingText}`}>
            Settings
          </h1>
          <p className={`mt-2 text-sm ${mutedText}`}>
            Manage your company preferences and notifications.
          </p>
        </header>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Company information */}
          <section className={cardClass}>
            <div className="mb-6 flex items-start gap-3">
              <div className={`rounded-lg p-2.5 ${iconBox}`}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 className={`font-semibold ${headingText}`}>
                  Company Information
                </h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  Configure your organization details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="companyName"
                  className={`block text-sm font-medium ${darkMode ? "text-slate-200" : "text-gray-700"}`}
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={settings.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="settingsEmail"
                  className={`block text-sm font-medium ${darkMode ? "text-slate-200" : "text-gray-700"}`}
                >
                  Admin Email
                </label>
                <input
                  id="settingsEmail"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </section>

          {/* Language */}
          <section className={cardClass}>
            <div className="mb-5 flex items-start gap-3">
              <div className={`rounded-lg p-2.5 ${iconBox}`}>
                <Globe size={20} />
              </div>
              <div>
                <h2 className={`font-semibold ${headingText}`}>Language</h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  Choose your preferred display language.
                </p>
              </div>
            </div>

            <label
              htmlFor="settingsLanguage"
              className={`block text-sm font-medium ${darkMode ? "text-slate-200" : "text-gray-700"}`}
            >
              Preferred Language
            </label>
            <select
              id="settingsLanguage"
              name="language"
              value={settings.language}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Hindi">Hindi</option>
            </select>
            <p className={`mt-2 text-xs ${mutedText}`}>
              This saves your preference; it does not automatically translate
              the application.
            </p>
          </section>

          {/* Notifications */}
          <section className={cardClass}>
            <div className="mb-5 flex items-start gap-3">
              <div
                className={`rounded-lg p-2.5 ${
                  darkMode
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                <Bell size={20} />
              </div>
              <div>
                <h2 className={`font-semibold ${headingText}`}>
                  Notifications
                </h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  Manage your notification preference.
                </p>
              </div>
            </div>

            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${
                darkMode
                  ? "border-slate-700 hover:bg-slate-700/50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <p className={`text-sm font-medium ${headingText}`}>
                  Enable Notifications
                </p>
                <p className={`mt-1 text-xs ${mutedText}`}>
                  Save your preferred notification setting.
                </p>
              </div>
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                className="h-5 w-5 shrink-0 cursor-pointer accent-blue-600"
              />
            </label>
          </section>

          {/* Security */}
          <section className={cardClass}>
            <div className="flex items-start gap-3">
              <div
                className={`rounded-lg p-2.5 ${
                  darkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Lock size={20} />
              </div>
              <div>
                <h2 className={`font-semibold ${headingText}`}>Security</h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  Password changes require a backend password-update feature.
                </p>
              </div>
            </div>
          </section>

          {/* Save */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
              darkMode
                ? "border-slate-700 bg-slate-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className={`flex items-center gap-2 text-xs ${mutedText}`}>
              <CheckCircle2 size={16} className="shrink-0 text-green-500" />
              Preferences are stored in this browser.
            </p>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save size={17} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
