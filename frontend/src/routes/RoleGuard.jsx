import { Navigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";

export default function RoleGuard({ children }) {
  const { token } = useRole();
  return token ? children : <Navigate to="/" />;
}