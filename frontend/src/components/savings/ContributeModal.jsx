import React, { useState } from 'react';
import Modal from '../common/Modal';
import { savingsService } from '../../services/savingsService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getCurrencySymbol } from '../../utils/formatters';

const ContributeModal = ({ isOpen, onClose, onContributed, goal }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await savingsService.contribute(goal.id, numAmount);
      setAmount('');
      onContributed();
    } catch (err) {
      setError(err.message || 'Failed to record contribution');
    } finally {
      setLoading(false);
    }
  };

  const currency = user?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);
  const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Money to "${goal.name}"`} maxWidth="440px">
      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: {formatCurrency(goal.target_amount, currency)}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
            Current Saved: {formatCurrency(goal.current_amount, currency)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
            {formatCurrency(remaining, currency)} left to reach goal!
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">How much are you adding today? ({currencySymbol}) *</label>
          <input
            type="number"
            step="0.01"
            min="1"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Quick Amount Suggestion Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[100, 200, 500, 1000].map((quick) => (
            <button
              key={quick}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setAmount(quick.toString())}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
            >
              +{currencySymbol}{quick}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add to Savings'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ContributeModal;
