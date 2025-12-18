import SeverityBadge from './SeverityBadge';

export default function DriftItemCard({ item, onOpen }: any) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">{item.method}</div>
          <div>
            <div className="font-medium text-gray-900">{item.endpointPath}</div>
            <div className="text-sm text-gray-500">{item.discrepancyType}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SeverityBadge severity={item.severity} />
          <button onClick={() => onOpen(item)} className="text-sm text-blue-600 hover:underline">Details</button>
        </div>
      </div>
    </div>
  );
}
