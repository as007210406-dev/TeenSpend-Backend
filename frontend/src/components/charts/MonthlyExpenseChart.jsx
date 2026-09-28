import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '0.65rem 0.9rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.85rem'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          {label}
        </div>
        {payload.map((p, idx) => (
          <div key={idx} style={{ color: p.color, fontWeight: 600, display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
            <span>{p.name}:</span>
            <span>{formatCurrency(p.value, currency)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyExpenseChart = ({ data = [], currency = 'INR', height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No monthly spending data recorded yet
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="label" 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={32}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>}
          />
          <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Bar dataKey="spent" name="Spent" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyExpenseChart;
