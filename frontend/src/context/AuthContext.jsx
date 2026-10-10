import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to read saved user:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = async (email, password) => {
    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post(
      "/auth/login",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data;

    if (!data.access_token) {
      throw new Error("No access token received from the server.");
    }

    // Save JWT token
    localStorage.setItem("token", data.access_token);

    /*
     * IMPORTANT:
     * Your backend currently does not expose /auth/me.
     *
     * Until we add/identify the correct user endpoint,
     * keep the account logged in.
     */
    const loggedUser = {
      name: email.split("@")[0],
      email: email,
      role: "admin",
    };

    localStorage.setItem(
      "user",
      JSON.stringify(loggedUser)
    );

    setUser(loggedUser);

    return loggedUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);