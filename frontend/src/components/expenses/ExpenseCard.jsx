import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { MoreVertical } from 'lucide-react';

const ExpenseCard = ({ expense, onView, onEdit, onDelete }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const catColor = expense.category?.color || '#6366F1';

  return (
    <div
      className="card card-hover"
      style={{ padding: '1rem', cursor: 'pointer', marginBottom: '0.75rem' }}
      onClick={() => onView(expense)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span
          className="badge"
          style={{
            backgroundColor: `${catColor}1A`,
            color: catColor
          }}
        >
          {expense.category?.name || 'Other'}
        </span>
        <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
          {formatDate(expense.expense_date)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {expense.description}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Paid via {expense.payment_method || 'Cash'}
            {expense.is_recurring && ' • Recurring'}
          </div>
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {formatCurrency(expense.amount, currency)}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
