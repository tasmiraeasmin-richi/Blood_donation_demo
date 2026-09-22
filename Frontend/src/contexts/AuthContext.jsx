import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { setAuthTokenGetter, onUnauthorized } from '../api/client';
import { login as apiLogin, signup as apiSignup, getProfile } from '../api/auth';

const AuthContext = createContext(null);

const STORAGE_KEY_RAKTOSETU = 'raktosetu_auth';

// Tracks where the current session is stored: 'local' (remembered across
// restarts) or 'session' (cleared when the tab closes). Set on load/login.
let activeStorage = null;

/**
 * Load persisted auth state. localStorage ("Remember me") is checked first,
 * then sessionStorage (this-tab-only session).
 * Token validity is decided by the backend (401 -> global logout),
 * so expired tokens are simply rejected on first use.
 */
function loadPersistedAuth() {
  const storages = [
    ['local', localStorage],
    ['session', sessionStorage],
  ];
  for (const [name, storage] of storages) {
    try {
      const raw = storage.getItem(STORAGE_KEY_RAKTOSETU);
      if (!raw) continue;
      const { user, token } = JSON.parse(raw);
      if (!user || !token) continue;
      activeStorage = name;
      return { user, token };
    } catch {
      storage.removeItem(STORAGE_KEY_RAKTOSETU);
    }
  }
  return null;
}

function persistAuth(user, token, remember = true) {
  if (user && token) {
    activeStorage = remember ? 'local' : 'session';
    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    target.setItem(STORAGE_KEY_RAKTOSETU, JSON.stringify({ user, token }));
    other.removeItem(STORAGE_KEY_RAKTOSETU);
  } else {
    activeStorage = null;
    localStorage.removeItem(STORAGE_KEY_RAKTOSETU);
    sessionStorage.removeItem(STORAGE_KEY_RAKTOSETU);
  }
}

export function AuthProvider({ children }) {
  // Lazily read persisted storage once (not on every render).
  const [persisted] = useState(loadPersistedAuth);
  const [user, setUser] = useState(persisted?.user ?? null);
  const [token, setToken] = useState(persisted?.token ?? null);
  // While a stored token is being validated against the backend, route
  // guards show a spinner instead of protected content or a login redirect.
  const [loading, setLoading] = useState(!!persisted?.token);
  const tokenRef = useRef(null);

  // Mirror token into a ref outside render so the API layer's
  // token getter never reads a stale closure value.
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    persistAuth(null, null);
  };

  // Wire the API layer: Bearer token source + global 401 handling.
  // Backend answers 401 for missing/expired/invalid tokens, so any
  // 401 anywhere in the app ends the session (restores guest state).
  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    onUnauthorized(() => logout());
  }, []);

  // On startup, validate any stored token against the backend (GET /user).
  // Invalid/expired tokens are cleared so stale sessions never render
  // protected content. Runs once; no request loops.
  useEffect(() => {
    if (!persisted?.token) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await getProfile(persisted.token);
        if (cancelled) return;
        setUser(profile);
        persistAuth(profile, persisted.token, activeStorage !== 'session');
      } catch {
        if (cancelled) return;
        setUser(null);
        setToken(null);
        persistAuth(null, null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const { token: jwt, user: profile } = await apiLogin(email, password);
    setUser(profile);
    setToken(jwt);
    persistAuth(profile, jwt, rememberMe);
    return profile;
  };

  const signup = async (data, rememberMe = true) => {
    const { token: jwt, user: profile } = await apiSignup(data);
    setUser(profile);
    setToken(jwt);
    persistAuth(profile, jwt, rememberMe);
    return profile;
  };

  const refreshProfile = async () => {
    const profile = await getProfile();
    setUser(profile);
    if (tokenRef.current) persistAuth(profile, tokenRef.current, activeStorage !== 'session');
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
