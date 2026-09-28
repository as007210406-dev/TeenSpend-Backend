import React from 'react';
import BudgetProgress from './BudgetProgress';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, PieChart } from 'lucide-react';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const isOverall = budget.isOverallBudget;
  const title = isOverall ? 'Overall Monthly Budget' : (budget.category?.name || 'Category Budget');
  const catColor = isOverall ? '#6366F1' : (budget.category?.color || '#8B5CF6');

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: `${catColor}1A`,
              color: catColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PieChart size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {budget.period} Period
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="btn-icon" onClick={() => onEdit(budget)} title="Edit Budget" style={{ padding: '0.35rem' }}>
            <Edit2 size={15} />
          </button>
          <button className="btn-icon" onClick={() => onDelete(budget)} title="Delete Budget" style={{ padding: '0.35rem', color: 'var(--status-danger)' }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(budget.spent, currency)}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            limit: {formatCurrency(budget.amount, currency)}
          </span>
        </div>

        <BudgetProgress percentUsed={budget.percentUsed} status={budget.status} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>
            {budget.remaining >= 0 ? 'Remaining:' : 'Over budget:'}
          </span>
          <span style={{ fontWeight: 700, color: budget.remaining < 0 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
            {formatCurrency(Math.abs(budget.remaining), currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
