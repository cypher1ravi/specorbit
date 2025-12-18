import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  loginWithPassword: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, name?: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
        // The interceptor in api.ts will pick up the new token
      },

      loginWithPassword: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data && response.data.user && response.data.tokens) {
          const { user, tokens } = response.data;
          get().setAuth(user, tokens.accessToken, tokens.refreshToken);
        }
        return response.data;
      },

      register: async (email, password, name) => {
        const response = await api.post('/auth/register', { email, password, name });
        if (response.data && response.data.user && response.data.tokens) {
          const { user, tokens } = response.data;
          get().setAuth(user, tokens.accessToken, tokens.refreshToken);
        }
        return response.data;
      },

      logout: async () => {
        try {
          // No need to call a logout endpoint if using stateless JWTs
          // await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout failed', error);
        } finally {
          // Always clear local state
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'specorbit-auth', // Save to localStorage
    }
  )
);