import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "./authApi";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        const response = await authApi.me();
        if (active) setUser(response.user);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const clearExpiredSession = () => setUser(null);
    window.addEventListener("ipc:auth-expired", clearExpiredSession);
    return () => window.removeEventListener("ipc:auth-expired", clearExpiredSession);
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The provider and its colocated hook intentionally share this small auth module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
