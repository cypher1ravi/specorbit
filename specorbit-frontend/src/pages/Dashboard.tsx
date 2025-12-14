import { useState } from 'react'; // Import useState
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus, Folder, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';
import CreateProjectModal from '../components/CreateProjectModal'; // Import Modal

interface Project {
  id: string;
  name: string;
  slug: string;
  teamId: string; // Ensure this is in the interface
  description?: string;
  updatedAt: string;
  _count?: { specs: number };
}

export default function Dashboard() {
  const { token } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal State

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get<Project[]>('/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
  });

  // Hack for MVP: Grab the Team ID from the first project or use a hardcoded fallback
  // In a real app, you'd fetch /api/me/teams
  const teamId = projects?.[0]?.teamId || 'fbb2f9c6-994b-47db-abf6-c2c2f9e7ab78'; // Use your known ID if list is empty

  if (isLoading) return <div className="text-center p-10">Loading projects...</div>;
  if (error) return <div className="text-red-500 p-10">Error loading projects.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your API documentation</p>
        </div>
        
        {/* Update Button onClick */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ... (Existing Project Card Code) ... */}
        {projects?.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Folder size={24} />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                v1.0.0
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
              {project.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
              <Link 
                to="/projects/$projectId" 
                params={{ projectId: project.id }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View Docs <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {projects?.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mb-4 mt-1">Create your first project to get started.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Render Modal */}
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        teamId={teamId}
      />
    </div>
  );
}