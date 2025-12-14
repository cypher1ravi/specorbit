import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    // 1. Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userJson = params.get('user');

    if (accessToken && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        
        // 2. Save to Zustand Store (and LocalStorage)
        login(user, accessToken);
        console.log('Login success:', user.email);

        // 3. Redirect to Dashboard
        navigate({ to: '/dashboard' });
      } catch (e) {
        console.error('Failed to parse user data', e);
        navigate({ to: '/login' });
      }
    } else {
      // If no token, go back to login
      navigate({ to: '/login' });
    }
  }, [login, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="text-gray-500">Completing login...</p>
    </div>
  );
}