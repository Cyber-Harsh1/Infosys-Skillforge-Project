import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { ROLES } from "../constants/roles";

/**
 * ProtectedRoute Component
 * - Ensures user is authenticated (token exists)
 * - Ensures user has one of the allowed roles
 * - Redirects safely without causing infinite loops
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  // 1. Retrieve authentication data from LocalStorage
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // 2. Normalize role for safe comparison
  const normalizedUserRole = userRole?.toUpperCase().trim();

  // 3. Normalize allowed roles
  const rolesToMatch = Array.isArray(allowedRoles)
    ? allowedRoles.map((role) => role.toString().toUpperCase().trim())
    : [];

  // 4. AUTHENTICATION CHECK
  if (!token) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 5. AUTHORIZATION CHECK
  if (rolesToMatch.length > 0 && !rolesToMatch.includes(normalizedUserRole)) {
    // Redirect unauthorized users to a neutral page (403)
    return <Navigate to="/403" replace />;
  }

  // 6. AUTHORIZED: Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
