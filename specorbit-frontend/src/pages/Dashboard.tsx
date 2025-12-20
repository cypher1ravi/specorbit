import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus, Folder, Clock, GitBranch, ShieldCheck, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(res => res.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-slate-400 font-medium italic">Loading Workspace...</div>
    </div>
  );

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Projects</h1>
          <p className="text-slate-500 font-medium">Monitoring {projects?.length || 0} production API endpoints</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> New Project
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects?.map((project: any) => (
          <Link 
            key={project.id} 
            to="/projects/$projectId" 
            params={{ projectId: project.id }}
            className="group block"
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 p-6">
                <ShieldCheck className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="mb-6 flex items-center justify-between">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <Folder size={28} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Sync
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-8 flex-1 leading-relaxed">
                {project.description || 'No project description provided.'}
              </p>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                  <GitBranch size={14} /> {project.githubBranch}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                  <Clock size={14} /> {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        teamId={projects?.[0]?.teamId || ''} 
      />
    </div>
  );
}