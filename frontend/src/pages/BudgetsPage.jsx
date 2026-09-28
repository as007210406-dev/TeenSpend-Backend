import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { budgetService } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetFormModal from '../components/budgets/BudgetFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { PieChart, Plus, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

const BudgetsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const { refreshKey } = useOutletContext() || {};

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const fetchBudgets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await budgetService.getBudgets();
      setBudgets(data?.budgets || []);
      setSummary(data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    try {
      await budgetService.deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
      fetchBudgets();
    } catch (err) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets & Limits</h1>
          <p className="page-subtitle">Set monthly and category limits to keep your spending in check</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setBudgetToEdit(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Set Budget
        </button>
      </div>

      {/* Legend & Accessibility Guide */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 600 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-success)' }}>
          <CheckCircle size={15} /> Green (&lt; 80%): Healthy
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-warning)' }}>
          <AlertTriangle size={15} /> Yellow (80% - 99%): Approaching Limit
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-danger)' }}>
          <AlertOctagon size={15} /> Red (≥ 100%): Exceeded
        </span>
      </div>

      {loading ? (
        <LoadingState message="Loading your budgets..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBudgets} />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No budgets set yet"
          description="Setting a budget helps you avoid running out of allowance before the month ends."
          actionLabel="+ Create First Budget"
          onAction={() => { setBudgetToEdit(null); setIsModalOpen(true); }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={(budget) => { setBudgetToEdit(budget); setIsModalOpen(true); }}
              onDelete={(budget) => setBudgetToDelete(budget)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <BudgetFormModal
          isOpen={isModalOpen}
          budgetToEdit={budgetToEdit}
          onClose={() => { setIsModalOpen(false); setBudgetToEdit(null); }}
          onSaved={() => {
            setIsModalOpen(false);
            setBudgetToEdit(null);
            fetchBudgets();
          }}
        />
      )}

      {budgetToDelete && (
        <ConfirmDialog
          isOpen={Boolean(budgetToDelete)}
          title="Delete Budget Limit?"
          message="Are you sure you want to delete this budget limit?"
          onClose={() => setBudgetToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default BudgetsPage;
