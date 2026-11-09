import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      let message = "Login failed. Please check your credentials.";

      if (err?.response?.status === 401) {
        message = "Invalid email or password.";
      } else if (err?.response?.data?.detail) {
        const detail = err.response.data.detail;
        message = typeof detail === "string" ? detail : "Invalid login request.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl mb-4">
            <span className="text-2xl font-bold text-white">O</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Orvexa</h1>
          <p className="text-blue-200 mt-2">AI Business Operating System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Login
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Sign in with your assigned organization credentials
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@orvexa.ai"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-gray-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;