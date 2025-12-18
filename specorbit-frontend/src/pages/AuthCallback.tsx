import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userJson = params.get('user');

    if (accessToken && refreshToken && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        
        setAuth(user, accessToken, refreshToken);
        console.log('Login success:', user.email);

        navigate({ to: '/dashboard' });
      } catch (e) {
        console.error('Failed to parse user data or set auth', e);
        navigate({ to: '/login' });
      }
    } else {
      console.error('Auth callback is missing required parameters.');
      navigate({ to: '/login' });
    }
  }, [setAuth, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="text-gray-500">Completing login...</p>
    </div>
  );
}