import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Education CRM</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-sm text-gray-500 mr-4 px-2 py-1 bg-gray-100 rounded">
                {user?.role}
              </span>
              <button
                onClick={logout}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Dashboard - STEP 1 muvaffaqiyatli tugatildi!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
