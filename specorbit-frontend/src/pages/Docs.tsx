import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Button from '../components/Button';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading, refetch } = useQuery(['docs', page, q], async () => {
    const res = await api.get('/docs', { params: { page, limit: 12, q: q || undefined } });
    return res.data;
  }, {
    keepPreviousData: true,
    placeholderData: { items: [], total: 0, page, limit: 12 }
  });

  useEffect(() => { setPage(1); }, [q]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documentation</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search docs or projects..."
              className="pl-10 pr-3 py-2 border rounded-md w-72 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : data?.items?.length === 0 ? (
          <div className="p-6 rounded-md border text-gray-600">No docs published yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((doc: any) => (
              <article key={doc.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{doc.title ?? doc.project?.name ?? 'Untitled'}</h3>
                    <p className="text-sm text-gray-500">{doc.version ?? 'v1'} • {doc.project?.name}</p>
                  </div>
                  <div className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</div>
                </div>

                <p className="text-sm text-gray-600 mt-3 line-clamp-3">{doc.description ?? ''}</p>

                <div className="mt-4 flex items-center gap-2">
                  <Button onClick={() => setSelected(doc)} variant="secondary">View</Button>
                  <a className="text-sm text-blue-600 hover:underline" href={`/projects/${doc.projectId}/specs/${doc.id}`} target="_blank" rel="noreferrer">Open in new tab</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Total: {data?.total ?? 0}</div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} variant="ghost">Previous</Button>
          <div className="px-3 py-1 border rounded">{page}</div>
          <Button onClick={() => setPage((p) => p + 1)} variant="ghost">Next</Button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-4 shadow-lg overflow-auto max-h-[85vh]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{selected.title ?? selected.project?.name}</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>

            <div className="h-[70vh] border rounded">
              {/* If spec object includes a raw JSON/swagger, render SwaggerUI */}
              {selected.rawSpec ? (
                <SwaggerUI spec={selected.rawSpec} />
              ) : (
                <pre className="p-3 text-xs overflow-auto h-full">{JSON.stringify(selected, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
