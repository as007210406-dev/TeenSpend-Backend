import React from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

const BudgetProgress = ({ percentUsed = 0, status = 'healthy' }) => {
  const percentClamped = Math.min(100, Math.max(0, percentUsed));

  let barColor = 'var(--status-success)';
  let StatusIcon = CheckCircle;
  let statusText = 'Healthy';

  if (status === 'danger' || percentUsed >= 100) {
    barColor = 'var(--status-danger)';
    StatusIcon = AlertOctagon;
    statusText = 'Exceeded';
  } else if (status === 'warning' || percentUsed >= 80) {
    barColor = 'var(--status-warning)';
    StatusIcon = AlertTriangle;
    statusText = 'Approaching Limit';
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: barColor, fontWeight: 700 }}>
          <StatusIcon size={14} />
          {statusText}
        </span>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
          {percentUsed.toFixed(0)}%
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}
        role="progressbar"
        aria-valuenow={percentUsed}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Budget usage: ${percentUsed}% (${statusText})`}
      >
        <div
          style={{
            width: `${percentClamped}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease-in-out'
          }}
        />
      </div>
    </div>
  );
};

export default BudgetProgress;
