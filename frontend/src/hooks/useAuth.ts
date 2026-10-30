import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../lib/auth.service';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      return {
        success: false,
        error: isAxiosError(error) && !error.response
          ? t('auth.networkError')
          : t('auth.loginFailed'),
      };
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error: unknown) {
      const status = isAxiosError(error)
        ? error.response?.status ?? 'network error'
        : 'unexpected error';
      console.error('Logout request failed:', status);
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
