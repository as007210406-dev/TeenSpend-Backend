import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { savingsService } from '../../services/savingsService';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/formatters';

const SavingsFormModal = ({ isOpen, onClose, onSaved, goalToEdit = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setFormData({
          name: goalToEdit.name || '',
          target_amount: goalToEdit.target_amount || '',
          current_amount: goalToEdit.current_amount || '0',
          target_date: goalToEdit.target_date ? goalToEdit.target_date.split('T')[0] : '',
          description: goalToEdit.description || ''
        });
      } else {
        setFormData({
          name: '',
          target_amount: '',
          current_amount: '0',
          target_date: '',
          description: ''
        });
      }
      setError('');
    }
  }, [isOpen, goalToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide a goal name');
      return;
    }
    if (!formData.target_amount || Number(formData.target_amount) <= 0) {
      setError('Target amount must be greater than zero');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        target_amount: Number(formData.target_amount),
        current_amount: Number(formData.current_amount) || 0,
        target_date: formData.target_date || null,
        description: formData.description ? formData.description.trim() : null
      };

      if (goalToEdit) {
        await savingsService.updateGoal(goalToEdit.id, payload);
      } else {
        await savingsService.createGoal(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save savings goal');
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = getCurrencySymbol(user?.currency || 'INR');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Goal Name *</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. New Headphones, Gaming PC, College Trip"
            value={formData.name}
            onChange={handleChange}
            maxLength={100}
            required
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Target Amount ({currencySymbol}) *</label>
            <input
              type="number"
              step="0.01"
              min="1"
              name="target_amount"
              placeholder="e.g. 5000"
              value={formData.target_amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Already Saved ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="current_amount"
              placeholder="0.00"
              value={formData.current_amount}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Target Date (Optional)</label>
          <input
            type="date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description or Notes</label>
          <textarea
            name="description"
            rows="2"
            placeholder="Why are you saving for this? Add any motivation notes here."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (goalToEdit ? 'Save Changes' : 'Create Goal')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SavingsFormModal;
