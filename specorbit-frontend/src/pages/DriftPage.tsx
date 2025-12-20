import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useDriftList, useResolveDrift } from '../hooks/useDrift';
import { 
  CheckCircle2, Search, Filter, RefreshCcw, 
  MoreHorizontal, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import DriftDetailsModal from '../components/DriftDetailsModal';

export default function DriftPage() {
  // Use typed params from router
  const { projectId } = useParams({ strict: false }) as any;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, isRefetching } = useDriftList(projectId, page, search);
  const resolveMutation = useResolveDrift(projectId);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
              Monitoring Active
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Drift Health</h1>
          <p className="text-slate-500 font-medium mt-1">
            Analyzing discrepancies between code and live traffic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoints..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-72 shadow-sm transition-all"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden transition-all">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Endpoint</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mismatch Type</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              // Skeleton Loading State
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-6"><div className="h-8 bg-slate-100 rounded-xl w-full" /></td>
                </tr>
              ))
            ) : data?.items?.length > 0 ? (
              data.items.map((drift: any) => (
                <tr key={drift.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                  <td className="px-8 py-6">
                    <SeverityBadge severity={drift.severity} />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          drift.method === 'GET' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {drift.method}
                        </span>
                        <button 
                          onClick={() => setSelected(drift)}
                          className="text-sm font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          {drift.endpointPath}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {drift.discrepancyType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => resolveMutation.mutate({ detectionId: drift.id, resolved: !drift.resolved })}
                        disabled={resolveMutation.isPending}
                        className={`p-2.5 rounded-xl transition-all ${
                          drift.resolved 
                            ? 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100' 
                            : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                        title={drift.resolved ? "Resolved" : "Mark as Resolved"}
                      >
                        {resolveMutation.isPending ? (
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : drift.resolved ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <RefreshCcw className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Empty State
              <tr>
                <td colSpan={4} className="py-32">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">System Healthy</h3>
                    <p className="text-slate-500 max-w-xs mt-2">
                      No drift detected between your specification and live API traffic.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <footer className="mt-8 flex items-center justify-between">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Page {page} of {Math.ceil((data?.total || 0) / 10)}
         </p>
         <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore}
              className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
         </div>
      </footer>

      {/* Modal */}
      {selected && (
        <DriftDetailsModal
          projectId={projectId}
          detection={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}