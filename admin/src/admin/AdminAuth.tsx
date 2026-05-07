import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminLogin from './AdminLogin';

export function logout() {
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminRole');
  localStorage.removeItem('adminName');
}

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });
  if (res.status === 401) {
    logout();
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  return res;
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
