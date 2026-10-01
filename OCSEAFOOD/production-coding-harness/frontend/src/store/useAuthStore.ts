import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  sessionReady: boolean;
  setAuth: (token: string | null, user: UserProfile) => void;
  beginSessionCheck: () => void;
  finishSessionCheck: () => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Bearer tokens remain an in-memory compatibility seam for tests and
      // non-browser clients. Browser login responses use the HttpOnly cookie.
      token: null,
      user: null,
      sessionReady: false,

      setAuth: (token, user) => set({ token, user, sessionReady: true }),
      beginSessionCheck: () => set({ sessionReady: false }),
      finishSessionCheck: () => set({ sessionReady: true }),
      clearAuth: () => set({ token: null, user: null, sessionReady: true }),
      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          set({ token: null, user: null, sessionReady: true });
        }
      },
    }),
    {
      name: "ocseafood-auth",
      version: 2,
      // The server session cookie is HttpOnly. Persist only display identity;
      // AuthSessionProvider validates it with the server on every page load.
      partialize: (state) => ({ user: state.user }),
      migrate: (persistedState) => {
        const previous = persistedState as { user?: UserProfile | null } | undefined;
        return {
          token: null,
          user: previous?.user ?? null,
          sessionReady: false,
        };
      },
    }
  )
);
