
import { useEffect, useState } from "react";
import {
  Save,
  Building2,
  Bell,
  Globe,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

const defaultSettings = {
  companyName: "Orvexa AI",
  email: "admin@orvexa.ai",
  language: "English",
  notifications: true,
};

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400";

const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200";

const cardClass =
  "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors duration-200 sm:p-6 dark:border-slate-700 dark:bg-slate-800";

function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);

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

  const handleChange = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!settings.companyName.trim() || !settings.email.trim()) {
      toast.error("Company name and email are required.");
      return;
    }

    setSaving(true);

    try {
      localStorage.setItem(
        "orvexaSettings",
        JSON.stringify(settings)
      );
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Unable to save settings in this browser.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 text-gray-900 transition-colors duration-200 sm:p-6 lg:p-8 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              Settings
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Manage your company preferences and notifications.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Preferences
          </span>
        </header>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Company information */}
          <section className={cardClass}>
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Building2 size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Company Information
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Configure your organization details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="companyName">
                  Company Name
                </label>
                <input
                  id="companyName"
                  className={inputClass}
                  value={settings.companyName}
                  onChange={(e) =>
                    handleChange("companyName", e.target.value)
                  }
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="adminEmail">
                  Admin Email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  className={inputClass}
                  value={settings.email}
                  onChange={(e) =>
                    handleChange("email", e.target.value)
                  }
                  placeholder="admin@company.com"
                  required
                />
              </div>
            </div>
          </section>

          {/* Regional preferences */}
          <section className={cardClass}>
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                <Globe size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Regional Preferences
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Choose your preferred display language.
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <label className={labelClass} htmlFor="language">
                Language
              </label>

              <select
                id="language"
                className={inputClass}
                value={settings.language}
                onChange={(e) =>
                  handleChange("language", e.target.value)
                }
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
              </select>

              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Saving a language preference does not automatically
                translate the application.
              </p>
            </div>
          </section>

          {/* Notifications */}
          <section className={cardClass}>
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Bell size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Manage your notification preference.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
              <div className="flex items-start gap-3">
                <Bell
                  size={19}
                  className="mt-0.5 shrink-0 text-gray-500 dark:text-slate-400"
                />

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Enable notifications
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Save your preferred notification setting.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  handleChange("notifications", e.target.checked)
                }
                className="h-5 w-5 shrink-0 cursor-pointer accent-blue-600"
              />
            </label>
          </section>

          {/* Security */}
          <section className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                <LockKeyhole size={20} />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Security
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Password changes require a backend password-update feature.
                </p>
              </div>
            </div>
          </section>

          {/* Save preferences */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
              <CheckCircle2
                size={16}
                className="shrink-0 text-green-500"
              />
              Preferences are stored in this browser.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-900"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
