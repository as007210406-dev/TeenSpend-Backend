import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Something went wrong',
  message = "We couldn't load your financial data right now.",
  onRetry
}) => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', margin: '1rem 0' }}>
      <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'var(--status-danger-bg)', color: 'var(--status-danger)', marginBottom: '1rem' }}>
        <AlertCircle size={36} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.925rem' }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
