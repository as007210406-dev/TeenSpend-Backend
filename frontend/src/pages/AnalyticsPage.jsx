import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import MonthlyExpenseChart from '../components/charts/MonthlyExpenseChart';
import SpendingTrendChart from '../components/charts/SpendingTrendChart';
import BudgetComparisonChart from '../components/charts/BudgetComparisonChart';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Tag, 
  Clock, 
  Sparkles,
  PieChart
} from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [metrics, setMetrics] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [spendingTrend, setSpendingTrend] = useState([]);
  const [budgetComparison, setBudgetComparison] = useState([]);
  const [trendTimeframe, setTrendTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [metricsData, cats, months, trends, budgetComp] = await Promise.all([
        analyticsService.getDeepMetrics(),
        analyticsService.getCategoryBreakdown(),
        analyticsService.getMonthlySpending(12),
        analyticsService.getSpendingTrends(trendTimeframe),
        analyticsService.getBudgetComparison()
      ]);

      setMetrics(metricsData);
      setCategoriesData(cats || []);
      setMonthlyHistory(months || []);
      setSpendingTrend(trends || []);
      setBudgetComparison(budgetComp || []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [trendTimeframe]);

  if (loading && !metrics) {
    return <LoadingState message="Calculating analytics and metrics..." />;
  }

  if (error && !metrics) {
    return <ErrorState message={error} onRetry={fetchAnalytics} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Spending Analytics</h1>
          <p className="page-subtitle">Deep dive into your financial habits and trends</p>
        </div>
      </div>

      {/* Primary Analytics Metric Cards (Section 26) */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Spending"
          value={formatCurrency(metrics?.totalSpending || 0, currency)}
          subtext="Current calendar month"
          icon={CreditCard}
          iconBg="var(--status-danger-bg)"
          iconColor="var(--status-danger)"
        />
        <StatCard
          title="Average Daily Spending"
          value={formatCurrency(metrics?.averageDailySpending || 0, currency)}
          subtext={`Over ${metrics?.daysElapsed || 1} days elapsed`}
          icon={Calendar}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="var(--accent-primary)"
        />
        <StatCard
          title="Average Weekly Spending"
          value={formatCurrency(metrics?.averageWeeklySpending || 0, currency)}
          subtext="Normalized 7-day average"
          icon={Clock}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="var(--accent-amber)"
        />
        <StatCard
          title="Savings Rate"
          value={`${metrics?.savingsRate || 0}%`}
          subtext={`Saved of ${formatCurrency(metrics?.totalIncome || 0, currency)} income`}
          icon={TrendingUp}
          iconBg="var(--status-success-bg)"
          iconColor="var(--status-success)"
        />
      </div>

      {/* Secondary Highlights Row */}
      <div className="dashboard-grid-equal" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(236, 72, 153, 0.15)',
            color: 'var(--accent-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Tag size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Highest Spending Category</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {metrics?.highestSpendingCategory ? metrics.highestSpendingCategory.name : 'None yet'}
            </div>
            {metrics?.highestSpendingCategory && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {formatCurrency(metrics.highestSpendingCategory.total, currency)} ({metrics.highestSpendingCategory.percentage}% of all expenses)
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--status-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CreditCard size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Most Expensive Transaction</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {metrics?.mostExpensiveTransaction ? formatCurrency(metrics.mostExpensiveTransaction.amount, currency) : 'None'}
            </div>
            {metrics?.mostExpensiveTransaction && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                "{metrics.mostExpensiveTransaction.description}" • {formatDate(metrics.mostExpensiveTransaction.date)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="dashboard-grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Category Distribution</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top categories</span>
          </div>
          <ExpensePieChart data={categoriesData} currency={currency} height={280} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Income vs Expenses</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Past 12 Months</span>
          </div>
          <MonthlyExpenseChart data={monthlyHistory} currency={currency} height={280} />
        </div>
      </div>

      {/* Timeframe Trends and Budget Comparison */}
      <div className="dashboard-grid-equal" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Spending Pace Trend</h3>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-tertiary)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
              {['7d', '30d', '3m', '6m', '1y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTrendTimeframe(tf)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    background: trendTimeframe === tf ? 'var(--bg-card)' : 'transparent',
                    color: trendTimeframe === tf ? 'var(--accent-primary)' : 'var(--text-muted)',
                    boxShadow: trendTimeframe === tf ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <SpendingTrendChart data={spendingTrend} currency={currency} height={260} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Budget Allocation & Usage</h3>
          </div>
          <BudgetComparisonChart data={budgetComparison} currency={currency} height={260} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
