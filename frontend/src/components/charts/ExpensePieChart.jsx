import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#14B8A6', '#F97316', '#64748B'];

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '0.65rem 0.9rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.85rem'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
          {item.categoryName || item.name}
        </div>
        <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
          {formatCurrency(item.total || item.value, currency)} ({item.percentage || 0}%)
        </div>
      </div>
    );
  }
  return null;
};

const ExpensePieChart = ({ data = [], currency = 'INR', height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No category expenses recorded yet
      </div>
    );
  }

  // Map data to Recharts expected format
  const chartData = data.map((d, index) => ({
    name: d.categoryName,
    value: Number(d.total) || 0,
    color: d.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    percentage: d.percentage
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
