import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Protect this route
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}