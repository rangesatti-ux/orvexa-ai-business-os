import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Pencil, Save, X, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api"; // Import your API helper client

export default function ProfilePage() {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
  });

  const [draft, setDraft] = useState(profile);

  // Sync profile state when Auth context updates
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
      setDraft({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const startEditing = () => {
    setDraft({ ...profile });
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    try {
      setLoading(true);

      // Sending changes to backend database via PUT/PATCH endpoint
      const response = await api.put("/profile/", {
        name: draft.name.trim(),
        email: draft.email.trim(),
      });

      const updatedData = response.data;

      setProfile({
        name: updatedData.name || draft.name.trim(),
        email: updatedData.email || draft.email.trim(),
        role: profile.role,
      });

      setEditing(false);
      toast.success("Profile successfully updated in the database!");
      
      // Optional: Refresh page or trigger auth state reload if your context supports it
      window.location.reload(); 
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to update profile on the server.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and update your personal account information.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700"
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelEditing}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <X size={17} />
            Cancel
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            <UserRound size={32} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {profile.name || "Your Name"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.email || "No email provided"}
            </p>
            <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {profile.role || "Employee"}
            </span>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Full Name
            </label>
            <input
              type="text"
              value={editing ? draft.name : profile.name}
              readOnly={!editing}
              onChange={(e) =>
                setDraft({ ...draft, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email Address
            </label>
            <input
              type="email"
              value={editing ? draft.email : profile.email}
              readOnly={!editing}
              onChange={(e) =>
                setDraft({ ...draft, email: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white read-only:bg-gray-50 dark:read-only:bg-gray-700"
              required
            />
          </div>

          {editing && (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={17} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </form>

        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
          Changes made here will securely update your account details in the database system.
        </p>
      </div>
    </div>
  );
}