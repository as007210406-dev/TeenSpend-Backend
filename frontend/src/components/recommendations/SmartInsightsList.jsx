import React from 'react';
import { 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  PiggyBank, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  PiggyBank,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Sparkles
};

const SmartInsightsList = ({ insights = [] }) => {
  if (!insights || insights.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem' }}>
        Add your expenses and budgets to generate smart insights!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {insights.map((ins, index) => {
        const IconComponent = ICON_MAP[ins.icon] || Sparkles;
        return (
          <div
            key={ins.id || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <IconComponent size={16} />
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.4' }}>
              {ins.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SmartInsightsList;
