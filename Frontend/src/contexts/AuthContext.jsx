import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { setAuthTokenGetter, onUnauthorized } from '../api/client';
import { login as apiLogin, signup as apiSignup, getProfile } from '../api/auth';

const AuthContext = createContext(null);

const STORAGE_KEY_RAKTOSETU = 'raktosetu_auth';

/**
 * Load persisted auth state from localStorage.
 * Token validity is decided by the backend (401 -> global logout),
 * so expired tokens are simply rejected on first use.
 */
function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RAKTOSETU);
    if (!raw) return null;
    const { user, token } = JSON.parse(raw);
    if (!user || !token) return null;
    return { user, token };
  } catch {
    localStorage.removeItem(STORAGE_KEY_RAKTOSETU);
    return null;
  }
}

function persistAuth(user, token) {
  if (user && token) {
    localStorage.setItem(STORAGE_KEY_RAKTOSETU, JSON.stringify({ user, token }));
  } else {
    localStorage.removeItem(STORAGE_KEY_RAKTOSETU);
  }
}

export function AuthProvider({ children }) {
  const persisted = loadPersistedAuth();
  const [user, setUser] = useState(persisted?.user ?? null);
  const [token, setToken] = useState(persisted?.token ?? null);
  const [loading] = useState(false);
  const tokenRef = useRef(null);

  // Mirror token into a ref outside render so the API layer's
  // token getter never reads a stale closure value.
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_RAKTOSETU);
  };

  // Wire the API layer: Bearer token source + global 401 handling.
  // Backend answers 401 for missing/expired/invalid tokens, so any
  // 401 anywhere in the app ends the session (restores guest state).
  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    onUnauthorized(() => logout());
  }, []);

  const login = async (email, password) => {
    const { token: jwt, user: profile } = await apiLogin(email, password);
    setUser(profile);
    setToken(jwt);
    persistAuth(profile, jwt);
    return profile;
  };

  const signup = async data => {
    const { token: jwt, user: profile } = await apiSignup(data);
    setUser(profile);
    setToken(jwt);
    persistAuth(profile, jwt);
    return profile;
  };

  const refreshProfile = async () => {
    const profile = await getProfile();
    setUser(profile);
    if (tokenRef.current) persistAuth(profile, tokenRef.current);
    return profile;
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isMember = isAuthenticated && user?.role === 'member';

  // Build value object
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isMember,
    login,
    signup,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
