import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userJson = localStorage.getItem('shopez_user');
  const token = localStorage.getItem('shopez_token');

  if (!token || !userJson) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userJson);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
