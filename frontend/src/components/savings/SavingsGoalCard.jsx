import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Target, PlusCircle, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

const SavingsGoalCard = ({
  goal,
  onContribute,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const isCompleted = goal.isCompleted || goal.current_amount >= goal.target_amount;
  const progressPercent = Math.min(100, goal.progress || 0);

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: isCompleted ? '4px solid var(--status-success)' : '4px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isCompleted ? 'var(--status-success-bg)' : 'rgba(99, 102, 241, 0.1)',
              color: isCompleted ? 'var(--status-success)' : 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isCompleted ? <CheckCircle2 size={20} /> : <Target size={20} />}
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {goal.name}
            </h4>
            {goal.target_date && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {formatDate(goal.target_date)}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="btn-icon" onClick={() => onEdit(goal)} title="Edit Goal" style={{ padding: '0.35rem' }}>
            <Edit2 size={15} />
          </button>
          <button className="btn-icon" onClick={() => onDelete(goal)} title="Delete Goal" style={{ padding: '0.35rem', color: 'var(--status-danger)' }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {goal.description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '-0.3rem 0 0.2rem 0' }}>
          {goal.description}
        </p>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCurrency(goal.current_amount, currency)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
              saved
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Goal: {formatCurrency(goal.target_amount, currency)}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.785rem' }}>
          <span style={{ color: isCompleted ? 'var(--status-success)' : 'var(--accent-primary)', fontWeight: 700 }}>
            {isCompleted ? 'Goal Reached! 🎉' : `${progressPercent.toFixed(0)}% complete`}
          </span>
          {!isCompleted && (
            <span style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(goal.remaining, currency)} remaining
            </span>
          )}
        </div>

        <div
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: isCompleted ? 'var(--status-success)' : 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-pink) 100%)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onContribute(goal)}
          style={{ color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
        >
          <PlusCircle size={15} /> Add Money
        </button>
      </div>
    </div>
  );
};

export default SavingsGoalCard;
