import { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session if token exists
  useEffect(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          setAuthToken(null);
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // POST /auth/login with email/password JSON payload
    const response = await api.post("/auth/login", { email, password });

    if (!response.data || !response.data.access_token) {
      throw new Error("No access_token received from server");
    }

    const token = response.data.access_token;

    // Call setAuthToken to set header and store access_token & token in localStorage
    setAuthToken(token);

    // Fetch user profile from /auth/me
    let userData = null;
    try {
      const meResponse = await api.get("/auth/me");
      userData = meResponse.data;
    } catch {
      userData = { email };
    }

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}