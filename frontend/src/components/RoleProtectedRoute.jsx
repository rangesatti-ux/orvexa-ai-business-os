import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 font-medium">Verifying permissions...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleProtectedRoute;