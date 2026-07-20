// routes/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // while AuthProvider is still checking sessionStorage
  if (loading) {
    return <div>Loading authentication...</div>; // or spinner
  }

  // if no user OR no token → redirect
  if (!user || !user.token) {
    return <Navigate to="/" replace />;
  }

  // if user exists
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
