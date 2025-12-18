import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const refresh = useAuthStore((s) => s.refresh);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    (async () => {
      try {
        // Call backend to exchange refresh cookie for access token + user
        const result = await refresh();
        if (result && result.accessToken && result.user) {
          setAuth(result.user, result.accessToken);
          navigate({ to: '/dashboard' });
          return;
        }
      } catch (err) {
        console.error('AuthCallback refresh failed', err);
      }
      navigate({ to: '/login' });
    })();
  }, [refresh, navigate, setAuth]);

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="text-gray-500">Completing login...</p>
    </div>
  );
}