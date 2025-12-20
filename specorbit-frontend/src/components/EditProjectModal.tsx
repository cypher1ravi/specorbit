// specorbit-frontend/src/components/EditProjectModal.tsx
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function EditProjectModal({ isOpen, onClose, project }: any) {
  const [form, setForm] = useState(project);
  const queryClient = useQueryClient();

  useEffect(() => { if (project) setForm(project); }, [project]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/projects/${project.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Edit Project Details</h2>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
            <input 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entry Path (CRITICAL)</label>
            <input 
              value={form.entryPath} onChange={e => setForm({...form, entryPath: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-mono text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}