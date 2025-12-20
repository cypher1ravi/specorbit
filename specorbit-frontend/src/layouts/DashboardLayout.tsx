import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate({ to: '/login' });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Subtle grid pattern background for modern aesthetic */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}