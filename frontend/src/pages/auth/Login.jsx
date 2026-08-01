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

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    // Login with role
    login(email, password);

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700">

      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700">
            Orvexa AI
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2">
            Business Operating System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="flex items-center border rounded-lg px-3">
            <Mail size={20} className="text-gray-500" />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 outline-none bg-transparent dark:text-white"
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
              className="w-full p-3 outline-none bg-transparent dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            Login
          </button>

        </form>

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

        {/* Demo Accounts */}

        <div className="mt-8 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">

          <h3 className="font-semibold mb-2 dark:text-white">
            Demo Accounts
          </h3>

          <p className="text-sm dark:text-gray-300">
            👑 Admin: <b>admin@gmail.com</b>
          </p>

          <p className="text-sm dark:text-gray-300">
            👨‍💼 HR: <b>hr@gmail.com</b>
          </p>

          <p className="text-sm dark:text-gray-300">
            👨 Employee: <b>employee@gmail.com</b>
          </p>

          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            Password can be anything for demo.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;