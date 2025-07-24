// src/components/admin/AdminProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default function AdminProtectedRoute({ component: Component, ...rest }) {
  const token = localStorage.getItem('adminToken'); // must match after login

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <Component {...props} />
        ) : (
          <Redirect to="/admin-login" />
        )
      }
    />
  );
}
