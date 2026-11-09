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

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await authService.getProfile();
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
    const profile = await authService.getProfile();

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