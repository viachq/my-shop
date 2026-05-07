import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

const API = '/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | true>;
  register: (name: string, email: string, phone: string, password: string) => Promise<string | true>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; password?: string; oldPassword?: string }) => Promise<string | true>;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

function loadSession(): { token: string; user: User } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (token && raw) return { token, user: JSON.parse(raw) };
  } catch { /* ignore */ }
  return null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const saved = loadSession();
  const [user, setUser] = useState<User | null>(saved?.user ?? null);
  const [token, setToken] = useState<string | null>(saved?.token ?? null);

  const saveSession = (t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string): Promise<string | true> => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return err.detail || 'Невірний email або пароль';
      }
      const data = await res.json();
      saveSession(data.access_token, data.user);
      return true;
    } catch {
      return 'Помилка з\'єднання з сервером';
    }
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, password: string): Promise<string | true> => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return err.detail || 'Помилка реєстрації';
      }
      const data = await res.json();
      saveSession(data.access_token, data.user);
      return true;
    } catch {
      return 'Помилка з\'єднання з сервером';
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string; password?: string; oldPassword?: string }): Promise<string | true> => {
    if (!token) return 'Не авторизовано';
    try {
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          ...(data.password ? { password: data.password } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return err.detail || 'Помилка оновлення';
      }
      const updated = await res.json();
      const newUser: User = { ...updated, phone: updated.phone || '' };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch {
      return 'Помилка з\'єднання з сервером';
    }
  }, [token]);

  const isAuthenticated = user !== null;

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated, login, register, logout, updateProfile }),
    [user, token, isAuthenticated, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
