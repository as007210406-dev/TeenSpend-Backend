import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/formatters';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Online / Wallet', 'Other'];

const ExpenseFormModal = ({ isOpen, onClose, onSaved, expenseToEdit = null }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    is_recurring: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats || []);
        if (!expenseToEdit && cats && cats.length > 0) {
          setFormData(prev => ({ ...prev, category_id: prev.category_id || cats[0].id }));
        }
      } catch {
        // Fallback
      }
    };

    if (isOpen) {
      fetchCategories();
      if (expenseToEdit) {
        setFormData({
          amount: expenseToEdit.amount || '',
          category_id: expenseToEdit.category_id || '',
          description: expenseToEdit.description || '',
          expense_date: expenseToEdit.expense_date ? expenseToEdit.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
          payment_method: expenseToEdit.payment_method || 'UPI',
          is_recurring: Boolean(expenseToEdit.is_recurring)
        });
      } else {
        setFormData({
          amount: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          description: '',
          expense_date: new Date().toISOString().split('T')[0],
          payment_method: 'UPI',
          is_recurring: false
        });
      }
      setError('');
    }
  }, [isOpen, expenseToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!formData.category_id) {
      setError('Please select an expense category');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a short description');
      return;
    }

    setLoading(true);
    try {
      if (expenseToEdit) {
        await expenseService.updateExpense(expenseToEdit.id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = getCurrencySymbol(user?.currency || 'INR');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Amount ({currencySymbol}) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Lunch with friends, Steam sale, Metro token"
            value={formData.description}
            onChange={handleChange}
            maxLength={255}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
          <input
            type="checkbox"
            id="is_recurring"
            name="is_recurring"
            checked={formData.is_recurring}
            onChange={handleChange}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
          <label htmlFor="is_recurring" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            This is a monthly recurring expense (e.g. Spotify, Discord Nitro)
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (expenseToEdit ? 'Save Changes' : 'Add Expense')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
