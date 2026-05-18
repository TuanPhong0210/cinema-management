import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  return localStorage.getItem('managerToken') ? <Outlet /> : <Navigate to="/manager/login" replace />;
}

