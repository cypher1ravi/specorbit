import { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { useAuthStore } from './stores/auth.store';

export default function App() {
  const refresh = useAuthStore((s) => s.refresh);

  useEffect(() => {
    // Attempt to restore session on app load
    (async () => {
      try {
        await refresh();
      } catch (err) {
        // ignore
      }
    })();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* This renders the child route (Login, Dashboard, etc.) */}
      <Outlet />
    </div>
  );
}