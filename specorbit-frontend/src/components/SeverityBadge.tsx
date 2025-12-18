import React from 'react';

const map = {
  critical: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-sky-100 text-sky-800',
  unknown: 'bg-gray-100 text-gray-800'
};

export default function SeverityBadge({ severity }: { severity?: string }) {
  const s = (severity || 'unknown').toLowerCase();
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] ?? map.unknown}`}>
      {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown'}
    </span>
  );
}
