
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Pencil, Save, X, UserRound } from "lucide-react";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      saved = {};
    }

    return {
      name: saved.name || user?.name || "",
      email: saved.email || user?.email || "",
    };
  });

  const [draft, setDraft] = useState(profile);

  const startEditing = () => {
    setDraft({ ...profile });
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const saveProfile = (event) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    const updated = {
      ...profile,
      name: draft.name.trim(),
      email: draft.email.trim(),
    };

    setProfile(updated);
    localStorage.setItem("user", JSON.stringify({
      ...(user || {}),
      ...updated,
    }));

    setEditing(false);
    toast.success("Profile updated on this browser.");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your profile information.
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
            />
          </div>

          {editing && (
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              <Save size={17} />
              Save Changes
            </button>
          )}
        </form>

        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
          Profile changes are saved locally in this browser. They do not
          change your account details on the server.
        </p>
      </div>
    </div>
  );
}
