import { create } from 'zustand';

export type UserRole = 'super_admin' | 'workspace_super_admin' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
