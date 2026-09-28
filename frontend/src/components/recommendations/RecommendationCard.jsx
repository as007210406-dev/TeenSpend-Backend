import React from 'react';
import { AlertTriangle, AlertOctagon, Info, CheckCircle, Lightbulb } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  const { type = 'info', priority = 'medium', title, message, category } = recommendation;

  let borderColor = 'var(--status-info)';
  let bgGradient = 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)';
  let Icon = Info;
  let iconColor = 'var(--status-info)';

  if (type === 'danger') {
    borderColor = 'var(--status-danger)';
    bgGradient = 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.02) 100%)';
    Icon = AlertOctagon;
    iconColor = 'var(--status-danger)';
  } else if (type === 'warning') {
    borderColor = 'var(--status-warning)';
    bgGradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)';
    Icon = AlertTriangle;
    iconColor = 'var(--status-warning)';
  } else if (type === 'success') {
    borderColor = 'var(--status-success)';
    bgGradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)';
    Icon = CheckCircle;
    iconColor = 'var(--status-success)';
  }

  return (
    <div
      className="card card-hover"
      style={{
        borderLeft: `4px solid ${borderColor}`,
        background: bgGradient,
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <div style={{ color: iconColor, flexShrink: 0, marginTop: '0.1rem' }}>
            <Icon size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {title}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.5' }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
          {category && (
            <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {category}
            </span>
          )}
          <span className={`badge badge-${type}`}>
            {priority} priority
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
