import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  s_no: number;
  name: string;
  email: string;
  phone: string;
  role_name: string;
  organization_id?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_id', user.s_no.toString());
        if (user.organization_id) {
          localStorage.setItem('organization_id', user.organization_id.toString());
        }
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('organization_id');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
