import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDriftList, useResolveDrift } from '../hooks/useDrift';
import Button from '../components/Button';
import SeverityBadge from '../components/SeverityBadge';
import DriftDetailsModal from '../components/DriftDetailsModal';
import { api } from '../lib/api';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function DriftPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ severity: 'all', resolved: 'all', q: '' });
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 300);
    return () => clearTimeout(t);
  }, [filters.q]);

  const { data, isLoading } = useDriftList(projectId!, page, debouncedQ);
  const resolveMutation = useResolveDrift(projectId!);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 12;
  const pages = Math.max(1, Math.ceil(total / limit));

  const onResolve = (id: string, resolved: boolean) => {
    resolveMutation.mutate({ id, resolved });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drift Detections</h1>
          <p className="text-sm text-gray-500">Monitor API behavior vs. your latest OpenAPI specs</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={filters.q}
            onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
            placeholder="Search endpoints..."
            className="border rounded px-3 py-2 w-64 focus:ring-1 focus:ring-blue-500"
          />
          <Button onClick={() => setPage(1)} variant="secondary">Search</Button>
          <Button onClick={() => api.post('/admin/drift/run')} variant="primary">
            <SparklesIcon className="w-4 h-4" /> Run Check
          </Button>
          <div className="rounded bg-gray-50 px-3 py-1 text-sm">{total} detections</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select className="border rounded px-2 py-1" value={filters.severity} onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value }))}>
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        <select className="border rounded px-2 py-1" value={filters.resolved} onChange={(e) => setFilters(f => ({ ...f, resolved: e.target.value }))}>
          <option value="all">All</option>
          <option value="true">Resolved</option>
          <option value="false">Unresolved</option>
        </select>
      </div>

      {isLoading && <div>Loading...</div>}

      {!isLoading && items.length === 0 && <div>No drift detections</div>}

      {!isLoading && data && (
        <div>
          {view === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((it: any) => (
                <div key={it.id} className="p-4 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <SeverityBadge severity={it.severity} />
                        <span className="font-mono">{it.method}</span>
                        <button className="text-lg font-medium ml-2 text-blue-600" onClick={() => setSelected(it)}>
                          {it.endpointPath}
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">{it.discrepancyType}</div>
                    </div>
                    <div>
                      <div>{it.actualResponse?.status ?? '-'}</div>
                      <div className="text-sm">{new Date(it.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => resolveMutation.mutate({ detectionId: it.id, resolved: !it.resolved })}
                      className="btn"
                    >
                      {it.resolved ? 'Unresolve' : 'Resolve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-auto bg-white rounded border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Severity</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Endpoint</th>
                    <th className="px-4 py-2">Discrepancy</th>
                    <th className="px-4 py-2">Actual</th>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it: any) => (
                    <tr key={it.id} className="border-t">
                      <td><SeverityBadge severity={it.severity} /></td>
                      <td className="font-mono">{it.method}</td>
                      <td>
                        <button className="text-blue-600" onClick={() => setSelected(it)}>{it.endpointPath}</button>
                      </td>
                      <td>{it.discrepancyType}</td>
                      <td>{it.actualResponse?.status ?? '-'}</td>
                      <td>{new Date(it.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => resolveMutation.mutate({ detectionId: it.id, resolved: !it.resolved })}
                          className="btn"
                        >
                          {it.resolved ? 'Unresolve' : 'Resolve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div>Page {page} / {pages}</div>
            <div className="space-x-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn">Prev</button>
              <button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="btn">Next</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <DriftDetailsModal
          projectId={projectId!}
          detection={selected}
          onClose={() => setSelected(null)}
          onResolved={(patched) => {
            setSelected({ ...selected, ...patched });
          }}
        />
      )}
    </div>
  );
}
