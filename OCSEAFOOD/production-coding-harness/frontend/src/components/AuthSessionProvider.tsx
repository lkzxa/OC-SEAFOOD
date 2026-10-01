"use client";

import { useEffect } from "react";
import { useAuthStore, UserProfile } from "@/store/useAuthStore";

export default function AuthSessionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const beginSessionCheck = useAuthStore((state) => state.beginSessionCheck);
  const finishSessionCheck = useAuthStore((state) => state.finishSessionCheck);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let active = true;
    // Remove the legacy JavaScript-readable JWT cookie created by older builds.
    document.cookie = "token=; Max-Age=0; Path=/; SameSite=Lax";
    beginSessionCheck();

    const restoreSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) return;

        if (response.ok) {
          const data = (await response.json()) as { user: UserProfile };
          setAuth(null, data.user);
          return;
        }

        if (response.status === 401) {
          clearAuth();
          return;
        }

        finishSessionCheck();
      } catch {
        if (active) finishSessionCheck();
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, [beginSessionCheck, clearAuth, finishSessionCheck, setAuth]);

  return children;
}
