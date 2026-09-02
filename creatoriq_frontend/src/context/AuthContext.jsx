import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "creatoriq_access_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (!ignore) setUser(response.data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) setCheckingSession(false);
      }
    }

    restoreSession();
    return () => {
      ignore = true;
    };
  }, [token]);

  async function login(email, password) {
    const response = await api.post(
      "/auth/login",
      new URLSearchParams({ username: email, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    setToken(response.data.access_token);
    const currentUser = await api.get("/auth/me");
    setUser(currentUser.data);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
