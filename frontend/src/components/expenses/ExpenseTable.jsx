import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, Eye } from 'lucide-react';

const ExpenseTable = ({
  expenses = [],
  onView,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const catColor = expense.category?.color || '#6366F1';
            return (
              <tr key={expense.id} style={{ cursor: 'pointer' }} onClick={() => onView(expense)}>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  {formatDate(expense.expense_date)}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {expense.description}
                  </div>
                  {expense.is_recurring && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                      ● Monthly Subscription
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: `${catColor}1A`,
                      color: catColor
                    }}
                  >
                    {expense.category?.name || 'Other'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', fontWeight: 600 }}>
                    {expense.payment_method || 'Cash'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {formatCurrency(expense.amount, currency)}
                </td>
                <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                    <button
                      className="btn-icon"
                      title="View Details"
                      onClick={() => onView(expense)}
                      style={{ padding: '0.4rem' }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      title="Edit Expense"
                      onClick={() => onEdit(expense)}
                      style={{ padding: '0.4rem' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      title="Delete Expense"
                      onClick={() => onDelete(expense)}
                      style={{ padding: '0.4rem', color: 'var(--status-danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
