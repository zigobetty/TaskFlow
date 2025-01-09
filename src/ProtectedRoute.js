import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || !currentUser.id) {
    console.log("User not logged in. Redirecting to /signin.");
    return <Navigate to="/signin" replace />;
  }

  console.log("User logged in. Rendering protected routes.");
  return <Outlet />;
};

export default ProtectedRoute;
