import { createContext, useContext, useState } from "react";

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));


  const loginAs = (tokenData) => {
  localStorage.setItem("token", tokenData.access_token);
  localStorage.setItem("role", tokenData.role);
  localStorage.setItem("userName", tokenData.full_name);
  localStorage.setItem("userId", tokenData.id);
  setToken(tokenData.access_token);
  setRole(tokenData.role);
  setUserName(tokenData.full_name);
  setUserId(tokenData.id);
};


  const clearRole = () => {
  localStorage.clear();
  setToken(null); setRole(null); setUserName(null); setUserId(null);
};

  return (
    <RoleContext.Provider value={{ role, userName, userId, token, loginAs, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);