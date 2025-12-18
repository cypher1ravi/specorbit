import SeverityBadge from './SeverityBadge';

export default function DriftItemRow({ item, onOpen }: any) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-4 py-3 text-sm">
        <SeverityBadge severity={item.severity} />
      </td>
      <td className="px-4 py-3 font-mono text-xs">{item.method}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.endpointPath}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{item.discrepancyType}</td>
      <td className="px-4 py-3 text-sm">{new Date(item.createdAt).toLocaleString()}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={() => onOpen(item)} className="text-sm text-blue-600 hover:underline">Details</button>
      </td>
    </tr>
  );
}
