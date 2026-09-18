import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useRole } from "./RoleContext";

const CreatorContext = createContext();

export function CreatorProvider({ children }) {
  const { role, userId } = useRole();
  const [managedCreators, setManagedCreators] = useState([]);
  const [creatorId, setCreatorId] = useState(null);

  useEffect(() => {
    if (!role) {
      setManagedCreators([]);
      setCreatorId(null);
      return;
    }
    setCreatorId(null); 
    api.get("/access/my-creators")
      .then((res) => {
        setManagedCreators(res.data);
        setCreatorId(res.data.length > 0 ? res.data[0].creator_id : null);
      })
      .catch(() => {
        setManagedCreators([]);
        setCreatorId(null);
      });
  }, [role, userId]); 

  return (
    <CreatorContext.Provider value={{ creatorId, setCreatorId, managedCreators }}>
      {children}
    </CreatorContext.Provider>
  );
}

export const useCreator = () => useContext(CreatorContext);