import React from 'react';
import { useDriftDetail, useResolveDrift } from '../hooks/useDrift';

export default function DriftDetailsModal({ projectId, detection, onClose, onResolved }: any) {
  const { data } = useDriftDetail(projectId, detection?.id);
  const resolve = useResolveDrift(projectId);

  if (!detection) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-11/12 max-w-3xl">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold">{detection.method} {detection.endpointPath}</h2>
          <div className="space-x-2">
            <button
              onClick={() => {
                resolve.mutate({ detectionId: detection.id, resolved: !detection.resolved }, {
                  onSuccess: (res: any) => onResolved(res.data)
                });
              }}
              className="btn"
            >
              {detection.resolved ? 'Unresolve' : 'Resolve'}
            </button>
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Spec (expected)</h3>
            <pre className="bg-gray-50 p-2 rounded text-xs max-h-64 overflow-auto">
              {JSON.stringify(data?.specDefinition ?? detection.specDefinition ?? {}, null, 2)}
            </pre>

          </div>
        </div>

        <div>
          <div>
            <h3 className="font-medium">Actual Response</h3>
            <div>Status: {detection.actualResponse?.status ?? data?.actualResponse?.status ?? '-'}</div>
            <pre className="bg-gray-50 p-2 rounded text-xs max-h-64 overflow-auto mt-2">
              {JSON.stringify(detection.actualResponse?.body ?? data?.actualResponse?.body ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div >
  );
}
