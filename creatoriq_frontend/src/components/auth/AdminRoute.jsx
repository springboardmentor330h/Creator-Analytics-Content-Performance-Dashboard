import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

function AdminRoute() {
  const { user, checkingSession } = useAuth();

  if (checkingSession) {
    return (
      <div className="auth-loading">
        <span className="auth-spinner" />
        Checking administrator access...
      </div>
    );
  }

  const role = (user?.role || "").trim().toLowerCase();

  const isAdmin =
    role === "admin" ||
    role === "administrator";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;