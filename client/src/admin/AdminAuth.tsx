import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminLogin from './AdminLogin';

export function logout() {
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('adminRole');
  localStorage.removeItem('adminName');
}

export function getAdminRole(): string | null {
  return localStorage.getItem('adminRole');
}

export function getAdminName(): string | null {
  return localStorage.getItem('adminName');
}

export default function RequireAuth() {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem('adminAuth') === 'true'
  );

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  return <Outlet />;
}
