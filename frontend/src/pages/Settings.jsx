import { useState } from "react";
import { Save, User, Bell, Lock, Globe } from "lucide-react";
import { toast } from "react-toastify";

function Settings() {
  const [settings, setSettings] = useState({
    companyName: "Orvexa AI",
    email: "admin@orvexa.ai",
    language: "English",
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem("orvexaSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">

        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <User size={20} />
            Company Information
          </h2>

          <input
            type="text"
            name="companyName"
            value={settings.companyName}
            onChange={handleChange}
            placeholder="Company Name"
            className="w-full border rounded-lg p-3 mb-4"
          />

          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
            placeholder="Company Email"
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Globe size={20} />
            Language
          </h2>

          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>English</option>
            <option>Telugu</option>
            <option>Hindi</option>
          </select>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Bell size={20} />
            Notifications
          </h2>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />
            Enable Notifications
          </label>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Lock size={20} />
            Security
          </h2>

          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Change Password
          </button>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          <Save size={18} />
          Save Settings
        </button>

      </div>
    </div>
  );
}

export default Settings;