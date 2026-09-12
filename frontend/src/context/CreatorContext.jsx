import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useRole } from "./RoleContext";

const CreatorContext = createContext();

export function CreatorProvider({ children }) {
  const { role } = useRole();
  const [managedCreators, setManagedCreators] = useState([]);
  const [creatorId, setCreatorId] = useState(null);

  useEffect(() => {
    if (!role) return;
    api.get("/access/my-creators")
      .then((res) => {
        setManagedCreators(res.data);
        if (res.data.length > 0) setCreatorId(res.data[0].creator_id);
      })
      .catch(() => setManagedCreators([]));
  }, [role]);

  return (
    <CreatorContext.Provider value={{ creatorId, setCreatorId, managedCreators }}>
      {children}
    </CreatorContext.Provider>
  );
}

export const useCreator = () => useContext(CreatorContext);