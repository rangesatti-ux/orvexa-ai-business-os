import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    let loggedUser;

    if (email === "admin@gmail.com") {
      loggedUser = {
        name: "Admin",
        email,
        role: "admin",
      };
    } else if (email === "hr@gmail.com") {
      loggedUser = {
        name: "HR Manager",
        email,
        role: "hr",
      };
    } else {
      loggedUser = {
        name: "Employee",
        email,
        role: "employee",
      };
    }

    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const logout = () => {
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