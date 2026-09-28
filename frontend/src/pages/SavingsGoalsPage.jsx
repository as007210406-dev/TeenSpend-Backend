import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { savingsService } from '../services/savingsService';
import { useAuth } from '../context/AuthContext';
import SavingsGoalCard from '../components/savings/SavingsGoalCard';
import SavingsFormModal from '../components/savings/SavingsFormModal';
import ContributeModal from '../components/savings/ContributeModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/common/StatCard';
import { formatCurrency } from '../utils/formatters';
import { PiggyBank, Plus, Target, CheckCircle2, Sparkles } from 'lucide-react';

const SavingsGoalsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const { refreshKey } = useOutletContext() || {};

  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [goalToContribute, setGoalToContribute] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await savingsService.getGoals();
      setGoals(data?.goals || []);
      setSummary(data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await savingsService.deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Turn your dreams into reality by saving up step by step</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setGoalToEdit(null); setIsModalOpen(true); }}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stat-grid" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Total Amount Saved"
            value={formatCurrency(summary.totalSaved, currency)}
            subtext={`Across ${goals.length} goals`}
            icon={PiggyBank}
            iconBg="var(--status-success-bg)"
            iconColor="var(--status-success)"
          />
          <StatCard
            title="Total Target Amount"
            value={formatCurrency(summary.totalTarget, currency)}
            subtext="Total goal targets"
            icon={Target}
            iconBg="rgba(99, 102, 241, 0.15)"
            iconColor="var(--accent-primary)"
          />
          <StatCard
            title="Overall Progress"
            value={`${summary.overallProgress}%`}
            subtext={`${summary.completedCount} completed, ${summary.activeCount} active`}
            icon={CheckCircle2}
            iconBg="rgba(245, 158, 11, 0.15)"
            iconColor="var(--accent-amber)"
          />
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading savings goals..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchGoals} />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No savings goals yet"
          description="What are you saving up for? A gaming PC, trip with friends, or new headphones?"
          actionLabel="+ Create First Savings Goal"
          onAction={() => { setGoalToEdit(null); setIsModalOpen(true); }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onContribute={(g) => setGoalToContribute(g)}
              onEdit={(g) => { setGoalToEdit(g); setIsModalOpen(true); }}
              onDelete={(g) => setGoalToDelete(g)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <SavingsFormModal
          isOpen={isModalOpen}
          goalToEdit={goalToEdit}
          onClose={() => { setIsModalOpen(false); setGoalToEdit(null); }}
          onSaved={() => {
            setIsModalOpen(false);
            setGoalToEdit(null);
            fetchGoals();
          }}
        />
      )}

      {goalToContribute && (
        <ContributeModal
          isOpen={Boolean(goalToContribute)}
          goal={goalToContribute}
          onClose={() => setGoalToContribute(null)}
          onContributed={() => {
            setGoalToContribute(null);
            fetchGoals();
          }}
        />
      )}

      {goalToDelete && (
        <ConfirmDialog
          isOpen={Boolean(goalToDelete)}
          title="Delete Savings Goal?"
          message={`Are you sure you want to delete "${goalToDelete.name}"?`}
          onClose={() => setGoalToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default SavingsGoalsPage;
