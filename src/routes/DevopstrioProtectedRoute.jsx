import { Navigate } from "react-router-dom";

const DevopstrioProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("devopstrioToken");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/devopstriologin" replace />;
  }

  // ✅ Logged in
  return children;
};

export default DevopstrioProtectedRoute;
