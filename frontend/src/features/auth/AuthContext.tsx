import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authApi } from "./authApi";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (payload: FormData) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_CHANNEL_NAME = "ipc-auth";
const AUTH_STORAGE_KEY = "ipc:auth-event";

type AuthSyncMessage = {
  type: "signed-out";
  timestamp: number;
};

function broadcastSignOut() {
  const message: AuthSyncMessage = { type: "signed-out", timestamp: Date.now() };

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage(message);
      channel.close();
    }
  } catch {
    // Continue to the storage fallback if the browser blocks the channel.
  }

  // The storage event is a fallback for browsers without BroadcastChannel.
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Some privacy modes disable storage; the current tab is still signed out.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionRevision = useRef(0);

  const clearSession = useCallback(() => {
    sessionRevision.current += 1;
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const revision = sessionRevision.current;
    async function restoreSession() {
      try {
        const response = await authApi.me();
        if (active && revision === sessionRevision.current) setUser(response.user);
      } catch {
        if (active && revision === sessionRevision.current) setUser(null);
      } finally {
        if (active && revision === sessionRevision.current) setIsLoading(false);
      }
    }
    void restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const clearExpiredSession = () => {
      clearSession();
      broadcastSignOut();
    };
    window.addEventListener("ipc:auth-expired", clearExpiredSession);
    return () => window.removeEventListener("ipc:auth-expired", clearExpiredSession);
  }, [clearSession]);

  useEffect(() => {
    const handleMessage = (message: AuthSyncMessage | null) => {
      if (message?.type === "signed-out") clearSession();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY || !event.newValue) return;
      try {
        handleMessage(JSON.parse(event.newValue) as AuthSyncMessage);
      } catch {
        // Ignore malformed values written by extensions or old app versions.
      }
    };
    let channel: BroadcastChannel | null = null;
    try {
      channel = "BroadcastChannel" in window
        ? new BroadcastChannel(AUTH_CHANNEL_NAME)
        : null;
    } catch {
      channel = null;
    }
    if (channel) channel.onmessage = (event: MessageEvent<AuthSyncMessage>) => handleMessage(event.data);
    window.addEventListener("storage", handleStorage);
    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearSession]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    sessionRevision.current += 1;
    setUser(response.user);
    setIsLoading(false);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      broadcastSignOut();
    }
  }, [clearSession]);

  const updateProfile = useCallback(async (payload: FormData) => {
    const response = await authApi.updateProfile(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, updateProfile }),
    [user, isLoading, login, logout, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The provider and its colocated hook intentionally share this small auth module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
