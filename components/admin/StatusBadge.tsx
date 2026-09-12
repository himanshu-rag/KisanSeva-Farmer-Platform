import React from 'react';

type StatusBadgeProps = {
  status: 'NORMAL' | 'BUSY' | 'CRITICAL' | 'LOW' | 'MEDIUM' | 'HIGH' | string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = status.toUpperCase();
  let colorClass = '';
  let label = '';
  let emoji = '';

  if (s === 'NORMAL' || s === 'LOW') {
    colorClass = 'badge-green';
    label = 'Normal';
    emoji = '🟢';
  } else if (s === 'BUSY' || s === 'MEDIUM') {
    colorClass = 'badge-yellow';
    label = 'Busy';
    emoji = '🟡';
  } else if (s === 'CRITICAL' || s === 'HIGH') {
    colorClass = 'badge-red';
    label = 'Critical';
    emoji = '🔴';
  } else {
    colorClass = 'badge-green';
    label = status;
  }

  return (
    <span className={colorClass} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
      {emoji} {label}
    </span>
  );
}
