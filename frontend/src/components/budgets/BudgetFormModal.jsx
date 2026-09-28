import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/formatters';

const BudgetFormModal = ({ isOpen, onClose, onSaved, budgetToEdit = null }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    category_id: '', // Empty string for overall budget
    period: 'monthly'
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats || []);
      } catch {
        // Fallback
      }
    };

    if (isOpen) {
      fetchCats();
      if (budgetToEdit) {
        setFormData({
          amount: budgetToEdit.amount || '',
          category_id: budgetToEdit.category_id || '',
          period: budgetToEdit.period || 'monthly'
        });
      } else {
        setFormData({
          amount: '',
          category_id: '',
          period: 'monthly'
        });
      }
      setError('');
    }
  }, [isOpen, budgetToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a budget amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: Number(formData.amount),
        category_id: formData.category_id ? formData.category_id : null,
        period: formData.period
      };

      if (budgetToEdit) {
        await budgetService.updateBudget(budgetToEdit.id, payload);
      } else {
        await budgetService.createBudget(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = getCurrencySymbol(user?.currency || 'INR');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Budget' : 'Set New Budget'}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Scope / Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">Overall Monthly Budget (All Expenses)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Choose "Overall" to set a cap for your entire month, or pick a specific category.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Budget Limit ({currencySymbol}) *</label>
          <input
            type="number"
            step="0.01"
            min="1"
            name="amount"
            placeholder="e.g. 5000"
            value={formData.amount}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Period</label>
          <select
            name="period"
            value={formData.period}
            onChange={handleChange}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (budgetToEdit ? 'Save Changes' : 'Create Budget')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetFormModal;
