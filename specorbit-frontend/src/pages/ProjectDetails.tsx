import { useParams, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { api } from '../lib/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ProjectDetails() {
  // 1. Get Project ID from URL
  const { projectId } = useParams({ strict: false });
  const queryClient = useQueryClient();

  // 2. Fetch Latest Spec
  const { data: spec, isLoading, error } = useQuery({
    queryKey: ['spec', projectId], 
    queryFn: async () => {
      // The auth header is now automatically added by the axios interceptor
      const res = await api.get(`/projects/${projectId}/specs/latest`);
      return res.data;
    },
    retry: false, // Don't retry if 404 (Empty project)
    staleTime: 0, // Always fetch fresh data
    gcTime: 0,    // (Garbage Collection) Don't keep old cache in memory
  });

  // 3. Mutation: Trigger Manual Sync
  const syncMutation = useMutation({
    mutationFn: async () => {
      // The auth header is now automatically added by the axios interceptor
      return await api.post(`/projects/${projectId}/sync`, {});
    },
    onSuccess: () => {
      // Refresh the spec data
      queryClient.invalidateQueries({ queryKey: ['spec', projectId] });
    },
    onError: () => {
      alert('Failed to sync documentation');
    }
  });

  // 4. Loading State
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 5. Empty/Error State (Show "Generate" button)
  if (error || !spec) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No documentation yet</h3>
        <p className="text-gray-500 max-w-sm">
          This project has no API specs. You can push code or generate a sample now.
        </p>
        <button
           onClick={() => syncMutation.mutate()}
           disabled={syncMutation.isPending}
           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
           <RefreshCw size={16} className={syncMutation.isPending ? 'animate-spin' : ''} />
           {syncMutation.isPending ? 'Generating...' : 'Generate Sample Docs'}
        </button>
      </div>
    );
  }

  // 6. Success State (Render Swagger UI)
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           {/* Header Info */}
           <div>
             <h1 className="text-2xl font-bold text-gray-900">
                {spec?.specJson?.info?.title || 'API Documentation'}
             </h1>
             <p className="text-sm text-gray-500">Version {spec?.version}</p>
           </div>
           
           {/* Actions */}
           <div className="flex items-center gap-3">
             <button
               onClick={() => syncMutation.mutate()}
               disabled={syncMutation.isPending}
               className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
             >
               <RefreshCw size={14} className={syncMutation.isPending ? 'animate-spin' : ''} />
               {syncMutation.isPending ? 'Syncing...' : 'Re-Sync'}
             </button>
             
             <Link to={`/projects/${projectId}/drift` as any} className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-500">View Drift</Link>
             
             <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200">
               Live Spec
             </span>
           </div>
        </div>
        
        {/* Swagger Viewer */}
        <div className="swagger-wrapper border-t border-gray-100 pt-4">
          <SwaggerUI spec={spec.specJson} />
        </div>
      </div>
    </div>
  );
}