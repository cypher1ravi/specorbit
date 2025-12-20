import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { specsApi } from '../lib/api';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function Docs() {
  const { projectId } = useParams({ strict: false }) as any;

  const { data: specRecord, isLoading } = useQuery({
    queryKey: ['latest-spec', projectId],
    queryFn: () => specsApi.getLatest(projectId).then(res => res.data),
    enabled: !!projectId,
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
      <p className="text-slate-500 font-bold">Compiling Interactive Documentation...</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <header className="px-8 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <h1 className="text-lg font-black text-slate-900 tracking-tight">API Reference</h1>
          <span className="text-[10px] font-bold text-slate-400 border px-2 py-0.5 rounded-full">{specRecord?.version || 'v1.0'}</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[600px] specorbit-docs">
          {specRecord?.specJson ? (
            <SwaggerUI spec={specRecord.specJson} />
          ) : (
            <div className="p-20 text-center text-slate-400 italic">No specification found. Trigger a sync to generate docs.</div>
          )}
        </div>
      </main>
    </div>
  );
}