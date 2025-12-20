import { useParams, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, FileCode, Github, Loader2, SettingsIcon } from 'lucide-react';
import { projectsApi } from '../lib/api';
import EditProjectModal from '../components/EditProjectModal';
import { useState } from 'react';

export default function ProjectDetails() {
  const { projectId } = useParams({ strict: false }) as any;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getOne(projectId).then(res => res.data),
    enabled: !!projectId, // 🛡️ Fix for 'undefined' error
  });

  const syncMutation = useMutation({
    mutationFn: () => projectsApi.sync(projectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['latest-spec', projectId] })
  });

  if (isLoading) return <div className="p-20 text-center text-slate-400 italic">Waking up SpecOrbit...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-30 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{project?.name}</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2"><Github size={16} /> {project?.githubRepoUrl}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditOpen(true)}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200"
          >
            <SettingsIcon size={20} />
          </button>

          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border rounded-xl hover:bg-slate-50"
          >
            {syncMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Manual Sync
          </button>
          <Link to="/docs/$projectId" params={{ projectId }}>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg">
              <FileCode size={16} /> View Docs
            </button>
          </Link>
        </div>
      </header>
      <main className="p-10 max-w-7xl mx-auto">
        <EditProjectModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          project={project}
        />
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black mb-6">Configuration</h3>
          <div className="grid grid-cols-2 gap-10">
            <div><p className="text-xs font-black text-slate-400 uppercase">Entry Point</p><p className="font-mono text-indigo-600">{project?.entryPath}</p></div>
            <div><p className="text-xs font-black text-slate-400 uppercase">Branch</p><p className="font-bold">{project?.githubBranch}</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}