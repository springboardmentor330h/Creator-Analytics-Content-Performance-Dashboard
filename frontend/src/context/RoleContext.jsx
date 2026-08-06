import { createContext, useContext, useState } from "react";

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  const loginAs = (tokenData) => {
    localStorage.setItem("token", tokenData.access_token);
    localStorage.setItem("role", tokenData.role);
    localStorage.setItem("userName", tokenData.full_name);
    setToken(tokenData.access_token);
    setRole(tokenData.role);
    setUserName(tokenData.full_name);
  };

  const clearRole = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setToken(null);
    setRole(null);
    setUserName(null);
  };

  return (
    <RoleContext.Provider value={{ role, userName, token, loginAs, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);