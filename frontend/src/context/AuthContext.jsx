import { createContext, useContext, useEffect, useState } from "react";
import api, { getCurrentUser, loginApi, registerApi } from "../services/api";

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
        const currentUser = await getCurrentUser();
        if (!ignore) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
        localStorage.removeItem(TOKEN_KEY);
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();
    return () => {
      ignore = true;
    };
  }, [token]);

  async function login(email, password) {
    const data = await loginApi(email, password);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  async function register(fullName, email, password) {
    await registerApi(fullName, email, password);
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, register, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
