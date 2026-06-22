import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile, cookieDays?: number) => void;
  clearAuth: () => void;
}

// Utility to set a cookie on the client side
// cookieDays = 0 → session cookie (no expires), > 0 → persistent cookie
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; Secure`;
  if (days > 0) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    cookie += `; expires=${expires}`;
  }
  document.cookie = cookie;
};

// Utility to delete a cookie on the client side
const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (token, user, cookieDays = 7) => {
        setCookie('token', token, cookieDays);
        set({ token, user });
      },

      clearAuth: () => {
        deleteCookie('token');
        set({ token: null, user: null });
      }
    }),
    {
      name: 'ocseafood-auth',
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
);
