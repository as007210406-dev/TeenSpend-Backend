import React from 'react';
import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Calendar, CreditCard, Tag, Clock, Repeat, Edit, Trash2 } from 'lucide-react';

const ExpenseDetailModal = ({
  isOpen,
  onClose,
  expense,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();

  if (!expense) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Expense Details">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Amount Spent</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
          {formatCurrency(expense.amount, user?.currency || 'INR')}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
          {expense.description}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Tag size={16} /> Category
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: expense.category?.color || '#6366F1' }} />
            {expense.category?.name || 'General'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Calendar size={16} /> Date
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {formatDate(expense.expense_date)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <CreditCard size={16} /> Payment Method
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {expense.payment_method || 'Cash'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Repeat size={16} /> Recurring
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: expense.is_recurring ? 'var(--status-info)' : 'var(--text-muted)' }}>
            {expense.is_recurring ? 'Yes (Monthly)' : 'No (One-off)'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Clock size={16} /> Created At
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {expense.created_at ? new Date(expense.created_at).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            onClose();
            onDelete(expense);
          }}
          style={{ color: 'var(--status-danger)' }}
        >
          <Trash2 size={16} /> Delete
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              onClose();
              onEdit(expense);
            }}
          >
            <Edit size={16} /> Edit Expense
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseDetailModal;
