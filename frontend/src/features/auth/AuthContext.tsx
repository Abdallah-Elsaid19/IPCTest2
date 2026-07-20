import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { authApi } from "./authApi";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggingOut: boolean;
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sessionRevision = useRef(0);
  const logoutPromise = useRef<Promise<void> | null>(null);

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

  const logout = useCallback(() => {
    if (logoutPromise.current) return logoutPromise.current;

    setIsLoggingOut(true);
    const request = authApi.logout().finally(() => {
      clearSession();
      broadcastSignOut();
      setIsLoggingOut(false);
      logoutPromise.current = null;
    });
    logoutPromise.current = request;
    return request;
  }, [clearSession]);

  const updateProfile = useCallback(async (payload: FormData) => {
    const response = await authApi.updateProfile(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isLoggingOut, login, logout, updateProfile }),
    [user, isLoading, isLoggingOut, login, logout, updateProfile],
  );
  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoggingOut && <LogoutOverlay />}
    </AuthContext.Provider>
  );
}

function LogoutOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/70 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      aria-describedby="logout-description"
    >
      <div className="w-full max-w-sm border border-primary-500/45 bg-background-950 px-8 py-9 text-center shadow-[0_28px_80px_rgba(0,0,0,0.65)]">
        <div className="relative mx-auto grid h-16 w-16 place-items-center">
          <LoaderCircle className="absolute animate-spin text-primary-500" size={64} strokeWidth={1.5} aria-hidden="true" />
          <LogOut className="text-background-100" size={22} aria-hidden="true" />
        </div>
        <h2 id="logout-title" className="mt-6 font-heading text-xl font-bold text-background-50">
          Signing out
        </h2>
        <p id="logout-description" className="mt-2 text-sm text-background-400">
          Ending your secure session…
        </p>
      </div>
    </div>
  );
}

// The provider and its colocated hook intentionally share this small auth module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
