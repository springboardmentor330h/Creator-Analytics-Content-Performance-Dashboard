import { createContext, useContext, useState } from "react";

const CreatorContext = createContext();

export function CreatorProvider({ children }) {
  const [creatorId, setCreatorId] = useState(
    Number(localStorage.getItem("creatorId")) || 1
  );

  const updateCreatorId = (id) => {
    localStorage.setItem("creatorId", id);
    setCreatorId(Number(id));
  };

  return (
    <CreatorContext.Provider value={{ creatorId, updateCreatorId }}>
      {children}
    </CreatorContext.Provider>
  );
}

export const useCreator = () => useContext(CreatorContext);