import { Link, useParams } from '@tanstack/react-router';
import { LayoutDashboard, FileCode, AlertTriangle, Zap, ChevronRight, UserIcon, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { projectId, id } = useParams({ strict: false }) as any;
  const activeId = projectId || id;

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, to: '/projects/$projectId', params: { projectId: activeId } },
    { label: 'API Docs', icon: FileCode, to: '/docs/$projectId', params: { projectId: activeId } },
    { label: 'Drift Health', icon: AlertTriangle, to: '/projects/$projectId/drift', params: { projectId: activeId } },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col h-screen border-r border-slate-800 shadow-2xl">
      <div className="p-6 mb-4">
        <Link to="/dashboard" className="flex items-center gap-3 font-bold text-white tracking-tight">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <span className="text-xl">SpecOrbit</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to as any}
            params={item.params}
            disabled={!activeId}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${!activeId ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'
              }`}
            activeProps={{ className: 'bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20' }}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {activeId && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
          </Link>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="group relative">
          <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-slate-900 shadow-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
              {console.log(JSON.stringify(user))}
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </button>

          {/* User Menu Dropdown */}
          <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all p-2 z-50">
            <Link to="/settings/profile" className="flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-700 rounded-lg text-slate-300">
              <UserIcon size={14} /> Profile Settings
            </Link>
            <Link to="/settings/team" className="flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-700 rounded-lg text-slate-300">
              <Users size={14} /> Team Management
            </Link>
            <div className="h-px bg-slate-700 my-1" />
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-slate-300"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}