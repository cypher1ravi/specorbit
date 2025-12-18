import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { api } from '../lib/api';

// Assuming a Project type is defined somewhere, if not, this is a good place
type Project = {
    id: string;
    name: string;
    description?: string | null;
    baseUrl?: string | null;
    githubRepoUrl?: string | null;
    githubBranch?: string | null;
    entryPath?: string | null;
};

interface ProjectSettingsProps {
    project: Project;
}

export default function ProjectSettings({ project }: ProjectSettingsProps) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || '');
    const [baseUrl, setBaseUrl] = useState(project.baseUrl || '');
    const [githubRepoUrl, setGithubRepoUrl] = useState(project.githubRepoUrl || '');
    const [githubBranch, setGithubBranch] = useState(project.githubBranch || 'main');
    const [entryPath, setEntryPath] = useState(project.entryPath || 'src/app.ts');
    
    const queryClient = useQueryClient();

    // Effect to reset form state if the project prop changes
    useEffect(() => {
        setName(project.name);
        setDescription(project.description || '');
        setBaseUrl(project.baseUrl || '');
        setGithubRepoUrl(project.githubRepoUrl || '');
        setGithubBranch(project.githubBranch || 'main');
        setEntryPath(project.entryPath || 'src/app.ts');
    }, [project]);

    const updateMutation = useMutation({
        mutationFn: async (updatedData: Partial<Project>) => {
            return await api.put(`/projects/${project.id}`, updatedData);
        },
        onSuccess: () => {
            // Invalidate and refetch the project data to show the latest version
            queryClient.invalidateQueries({ queryKey: ['project', project.id] });
            queryClient.invalidateQueries({ queryKey: ['projects'] }); // Also invalidate the list
        },
        onError: (error) => {
            // You should probably show a toast notification here
            alert(`Error updating project: ${error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData = {
            name,
            description,
            baseUrl,
            githubRepoUrl,
            githubBranch,
            entryPath,
        };
        updateMutation.mutate(updatedData);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Project Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base URL (for Drift Detection)
                    </label>
                    <input
                        type="url"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="https://api.example.com"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub Repository
                    </label>
                    <div className="flex rounded-md shadow-sm">
                         <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                github.com/
                         </span>
                        <input
                            type="text"
                            value={githubRepoUrl}
                            onChange={(e) => setGithubRepoUrl(e.target.value)}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                            placeholder="username/repo"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Branch
                        </label>
                        <input
                            type="text"
                            value={githubBranch}
                            onChange={(e) => setGithubBranch(e.targe.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Entry Path 
                        </label>
                        <input
                            type="text"
                            value={entryPath}
                            onChange={(e) => setEntryPath(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
