import { User, Mail, Phone, Shield } from "lucide-react";

function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow-lg p-8">

        <div className="flex items-center gap-6">
          <User size={80} className="text-blue-600" />

          <div>
            <h2 className="text-2xl font-bold">Admin</h2>
            <p className="text-gray-500">Administrator</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="flex items-center gap-3 border rounded-lg p-4">
            <Mail className="text-blue-600" />
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p>admin@orvexa.ai</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-4">
            <Phone className="text-green-600" />
            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              <p>+91 9876543210</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-4">
            <Shield className="text-red-600" />
            <div>
              <p className="text-gray-500 text-sm">Role</p>
              <p>Administrator</p>
            </div>
          </div>

        </div>

        <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          Edit Profile
        </button>

      </div>
    </div>
  );
}

export default ProfilePage;