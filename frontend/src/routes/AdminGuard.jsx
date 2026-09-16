import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Nested inside RoleGuard, so we already know the user is authenticated.
 * This just additionally checks they hold the Administrator role. */
export default function AdminGuard() {
  const { user } = useAuth();

  if (user?.role !== "Administrator") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
