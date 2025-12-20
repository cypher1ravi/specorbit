import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Plus, Github, Link as LinkIcon, Box } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
}

export default function CreateProjectModal({ isOpen, onClose, teamId }: CreateProjectModalProps) {
    const [form, setForm] = useState({
        name: '', description: '', baseUrl: '', 
        githubRepoUrl: '', githubBranch: 'main', entryPath: 'src/app.ts'
    });
    const { token } = useAuthStore();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/projects', data, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            onClose();
            setForm({ name: '', description: '', baseUrl: '', githubRepoUrl: '', githubBranch: 'main', entryPath: 'src/app.ts' });
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200 border border-slate-200">
                <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Project</h2>
                        <p className="text-sm text-slate-500 font-medium">Connect your API to start monitoring</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, teamId }); }} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
                                <input
                                    required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="e.g. Payment API"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base URL</label>
                                <input
                                    type="url" value={form.baseUrl} onChange={(e) => setForm({...form, baseUrl: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="https://api.prod.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GitHub Repo Path</label>
                            <div className="relative">
                                <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={form.githubRepoUrl} onChange={(e) => setForm({...form, githubRepoUrl: e.target.value})}
                                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="username/repository"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch</label>
                                <input
                                    value={form.githubBranch} onChange={(e) => setForm({...form, githubBranch: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entry File</label>
                                <input
                                    value={form.entryPath} onChange={(e) => setForm({...form, entryPath: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={createMutation.isPending}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} strokeWidth={3} />}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}