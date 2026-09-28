import React from 'react';

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = 'var(--status-info-bg)',
  iconColor = 'var(--status-info)'
}) => {
  return (
    <div className="stat-card">
      <div>
        <span className="stat-label">{title}</span>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
      {Icon && (
        <div className="stat-icon-wrapper" style={{ background: iconBg, color: iconColor }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
