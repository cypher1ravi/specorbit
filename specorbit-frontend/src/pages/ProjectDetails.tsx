import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { api } from '../lib/api';
import { Loader2, AlertCircle, RefreshCw, BookOpen, Settings } from 'lucide-react';
import ProjectSettings from '../components/ProjectSettings'; // Make sure this path is correct

export default function ProjectDetails() {
  const { projectId } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('documentation');

  // 1. Fetch the entire project, which includes the latest spec
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId], 
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/projects/${projectId}/sync`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: () => {
      alert('Failed to sync documentation');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const latestSpec = project?.specs?.[0];

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Project Not Found</h3>
        <p className="text-gray-500 max-w-sm">
          We couldn't find the project you're looking for. It might have been moved or deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold text-gray-900">
              {project.name}
           </h1>
           <p className="text-sm text-gray-500">Version {latestSpec?.version || 'N/A'}</p>
         </div>
         
         <div className="flex items-center gap-3">
           <button
             onClick={() => syncMutation.mutate()}
             disabled={syncMutation.isPending}
             className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
           >
             <RefreshCw size={14} className={syncMutation.isPending ? 'animate-spin' : ''} />
             {syncMutation.isPending ? 'Syncing...' : 'Re-Sync'}
           </button>
         </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('documentation')}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'documentation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpen size={16} />
            Documentation
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings size={16} />
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'documentation' && (
          <>
            {!latestSpec && (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No documentation yet</h3>
                <p className="text-gray-500 max-w-sm">
                  This project has no API specs. You can push code or generate one now.
                </p>
                <button
                   onClick={() => syncMutation.mutate()}
                   disabled={syncMutation.isPending}
                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                   <RefreshCw size={16} className={syncMutation.isPending ? 'animate-spin' : ''} />
                   {syncMutation.isPending ? 'Generating...' : 'Generate Docs'}
                </button>
              </div>
            )}
            {latestSpec && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="swagger-wrapper">
                  <SwaggerUI spec={latestSpec.specJson} />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'settings' && <ProjectSettings project={project} />}
      </div>
    </div>
  );
}