import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default AdminRoute;
