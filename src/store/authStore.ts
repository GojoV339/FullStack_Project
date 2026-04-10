import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudentProfile } from '@/types';

interface AuthState {
  student: StudentProfile | null;
  isAuthenticated: boolean;

  setStudent: (student: StudentProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      student: null,
      isAuthenticated: false,

      setStudent: (student: StudentProfile) => {
        set({ student, isAuthenticated: true });
      },

      logout: () => {
        set({ student: null, isAuthenticated: false });
        // Clear cookie via API
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      },
    }),
    {
      name: 'amrita-feast-auth',
    }
  )
);
