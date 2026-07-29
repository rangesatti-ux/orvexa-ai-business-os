import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple frontend validation
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    // Temporary login (replace with backend API later)
    login();

    // Redirect to dashboard
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700">
            Orvexa AI
          </h1>

          <p className="text-gray-500 mt-2">
            Business Operating System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="flex items-center border rounded-lg px-3">
            <Mail size={20} className="text-gray-500" />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 outline-none"
              required
            />
          </div>

          <div className="flex items-center border rounded-lg px-3">
            <Lock size={20} className="text-gray-500" />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Login
          </button>

        </form>

        {/* Links */}
        <div className="mt-6 flex justify-between text-sm">

          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>

          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>

        </div>

      </div>
    </div>
  );
}

export default Login;