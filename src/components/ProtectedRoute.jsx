// ProtectedRoute.jsx

import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ isLoggedIn, children, anonymous = false }) {
  const location = useLocation();
  const from = location.state?.from || "/";

  if (anonymous && isLoggedIn) {
    return <Navigate to={from} />;
  }

  if (!anonymous && !isLoggedIn) {
    // If user isn't logged in, return a Navigate component that sends the user to /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Otherwise, render the protected route's child component.
  return children;
}

export default ProtectedRoute;
