import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import './index.css';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminPage } from './pages/AdminPage';
import { AgentsPage } from './pages/AgentsPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationsPage } from './pages/NotificationsPage';

function RequireAuth() {
  const { session, user } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (!user) {
    return <div className="p-8 text-sm text-slate-500">Loading session...</div>;
  }
  return <Outlet />;
}

function RequireAdmin() {
  const { user } = useAuth();
  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<LoginPage admin />} />
          <Route element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<AgentsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
