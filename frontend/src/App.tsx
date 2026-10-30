import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { authService } from './lib/auth.service';
import { useAuthStore, type User } from './store/auth.store';

let sessionRestoration: Promise<User | null> | null = null;

function restoreSession(): Promise<User | null> {
  sessionRestoration ??= authService.me().catch((error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  });
  return sessionRestoration;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { setLoading, setUser } = useAuthStore();

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      try {
        const user = await restoreSession();
        if (active) {
          setUser(user);
        }
      } catch (error: unknown) {
        if (active) {
          setUser(null);
          const status = isAxiosError(error)
            ? error.response?.status ?? 'network error'
            : 'unexpected error';
          console.error('Session restoration failed:', status);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initializeSession();
    return () => {
      active = false;
    };
  }, [setLoading, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
