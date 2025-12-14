import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, Plus, Settings, LogOut, BookOpen } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

export default function Sidebar() {
  const { logout } = useAuthStore();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
          S
        </div>
        <span className="text-xl font-bold tracking-tight">SpecOrbit</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Projects" />
        <NavItem to="/docs" icon={<BookOpen size={20} />} label="Documentation" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-gray-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md w-full transition-colors"
        >
          <LogOut size={20} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  // Simple active state check (can be improved with router state)
  const isActive = window.location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}