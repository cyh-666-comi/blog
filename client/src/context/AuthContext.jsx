import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('diary_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('diary_user'); }
    }
    setLoading(false);
  }, []);

  // 游客登录
  const loginAsGuest = useCallback((name) => {
    const guest = { username: name, role: 'guest', isGuest: true };
    localStorage.setItem('diary_user', JSON.stringify(guest));
    setUser(guest);
  }, []);

  // 用户登录
  const login = useCallback(async (username, password) => {
    const res = await authAPI.login({ username, password });
    const u = { ...res.user, isGuest: false };
    localStorage.setItem('diary_user', JSON.stringify(u));
    localStorage.setItem('token', res.token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('diary_user');
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const isUser = user && !user.isGuest;

  return (
    <AuthContext.Provider value={{ user, loading, isUser, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}
