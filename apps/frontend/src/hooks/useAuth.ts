import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../lib/auth.service';
import { isAxiosError } from 'axios';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.me();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (isLoading) {
      checkAuth();
    }
  }, [isLoading, setUser, setLoading]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: true } | { success: false; error: string }> => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      navigate('/dashboard');
      return { success: true };
    } catch (error: unknown) {
      const responseMessage = isAxiosError<{ message?: unknown }>(error)
        ? error.response?.data?.message
        : undefined;

      return {
        success: false,
        error:
          typeof responseMessage === 'string'
            ? responseMessage
            : 'Login failed',
      };
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
  };
}
