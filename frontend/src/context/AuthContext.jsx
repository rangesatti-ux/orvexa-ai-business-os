import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to read saved user:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Helper to normalize user payload and ensure employee_id mapping
  const formatUserProfile = (rawProfile) => {
    if (!rawProfile) return null;

    return {
      ...rawProfile,
      id: rawProfile.id,
      // Map linked employee record ID across varying backend schema formats
      employee_id:
        rawProfile.employee_id ||
        rawProfile.employee?.id ||
        rawProfile.id,
      name: rawProfile.name || rawProfile.full_name || "User",
      email: rawProfile.email,
      role: rawProfile.role ? rawProfile.role.toLowerCase() : "employee",
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const rawProfile = await authService.getProfile();
          const profile = formatUserProfile(rawProfile);

          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);

    if (!data.access_token) {
      throw new Error("No access token received from the server.");
    }

    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);

    // Fetch real profile from backend GET /auth/me
    const rawProfile = await authService.getProfile();
    const profile = formatUserProfile(rawProfile);

    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);

    return profile;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    return allowedRoles.map((r) => r.toLowerCase()).includes(userRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);