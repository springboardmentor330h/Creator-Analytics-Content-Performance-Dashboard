import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { token, checkingSession } = useAuth();
  const location = useLocation();

  if (checkingSession) {
    return (
      <div className="auth-loading">
        <span className="auth-spinner" />
        Checking your session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
