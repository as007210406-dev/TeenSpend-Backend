import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { budgetService } from '../services/budgetService';
import { savingsService } from '../services/savingsService';
import { expenseService } from '../services/expenseService';
import { recommendationService } from '../services/recommendationService';
import StatCard from '../components/common/StatCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import MonthlyExpenseChart from '../components/charts/MonthlyExpenseChart';
import BudgetComparisonChart from '../components/charts/BudgetComparisonChart';
import SpendingTrendChart from '../components/charts/SpendingTrendChart';
import BudgetCard from '../components/budgets/BudgetCard';
import SavingsGoalCard from '../components/savings/SavingsGoalCard';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseDetailModal from '../components/expenses/ExpenseDetailModal';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import BudgetFormModal from '../components/budgets/BudgetFormModal';
import SavingsFormModal from '../components/savings/SavingsFormModal';
import ContributeModal from '../components/savings/ContributeModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import SmartInsightsList from '../components/recommendations/SmartInsightsList';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  Receipt, 
  Plus, 
  ArrowRight,
  PieChart as PieIcon,
  Sparkles
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const { refreshKey, triggerRefresh } = useOutletContext() || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard Data State
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [budgetComparison, setBudgetComparison] = useState([]);
  const [spendingTrend, setSpendingTrend] = useState([]);
  const [trendTimeframe, setTrendTimeframe] = useState('30d');
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);

  // Modals state
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const [goalToEdit, setGoalToEdit] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToContribute, setGoalToContribute] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [
        sumData,
        catData,
        monthData,
        budgetCompData,
        trendData,
        budgetList,
        savingsData,
        expensesData,
        recsData
      ] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getCategoryBreakdown(),
        analyticsService.getMonthlySpending(6),
        analyticsService.getBudgetComparison(),
        analyticsService.getSpendingTrends(trendTimeframe),
        budgetService.getBudgets(),
        savingsService.getGoals(),
        expenseService.getExpenses({ limit: 5 }),
        recommendationService.getRecommendations()
      ]);

      setSummary(sumData);
      setCategoryBreakdown(catData || []);
      setMonthlyHistory(monthData || []);
      setBudgetComparison(budgetCompData || []);
      setSpendingTrend(trendData || []);
      setBudgets(budgetList?.budgets || []);
      setSavingsGoals(savingsData?.goals || []);
      setRecentExpenses(expensesData?.expenses || []);
      setRecommendations(recsData?.recommendations || []);
      setInsights(recsData?.insights || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey, trendTimeframe]);

  // Handle deletions
  const handleDeleteExpenseConfirm = async () => {
    if (!expenseToDelete) return;
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      triggerRefresh?.();
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const handleDeleteBudgetConfirm = async () => {
    if (!budgetToDelete) return;
    try {
      await budgetService.deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  const handleDeleteGoalConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await savingsService.deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete savings goal');
    }
  };

  if (loading && !summary) {
    return <LoadingState message="Loading TeenSpend dashboard..." />;
  }

  if (error && !summary) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Hey, {user?.full_name ? user.full_name.split(' ')[0] : 'there'}! 👋
          </h1>
          <p className="page-subtitle">
            Here's what is happening with your allowance and spending this month.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsBudgetModalOpen(true)}>
            <PieIcon size={16} /> Set Budget
          </button>
          <button className="btn btn-primary" onClick={() => setIsExpenseModalOpen(true)}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* 1. Summary Cards (Section 19) */}
      <div className="stat-grid">
        <StatCard
          title="Total Income / Allowance"
          value={formatCurrency(summary?.totalIncome || 0, currency)}
          subtext="Earnings & gifts this month"
          icon={TrendingUp}
          iconBg="var(--status-success-bg)"
          iconColor="var(--status-success)"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpenses || 0, currency)}
          subtext={`${summary?.transactionCount || 0} transactions`}
          icon={Receipt}
          iconBg="var(--status-danger-bg)"
          iconColor="var(--status-danger)"
        />
        <StatCard
          title="Money Saved"
          value={formatCurrency(summary?.moneySaved || 0, currency)}
          subtext={`${summary?.savingsRate || 0}% savings rate`}
          icon={PiggyBank}
          iconBg="var(--status-info-bg)"
          iconColor="var(--status-info)"
        />
        <StatCard
          title="Remaining Budget"
          value={formatCurrency(summary?.remainingBudget || 0, currency)}
          subtext={summary?.budgetAmount ? `of ${formatCurrency(summary.budgetAmount, currency)} limit` : 'No overall budget set'}
          icon={Wallet}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="var(--accent-amber)"
        />
      </div>

      {/* High Priority Alerts (Section 28) */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--accent-primary)" /> Smart Spending Advice
            </h3>
            <Link to="/recommendations" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              View all insights <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          {recommendations.slice(0, 2).map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}

      {/* 2. Charts Row: Category Donut & Monthly History (Section 20) */}
      <div className="dashboard-grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monthly Spending History</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Past 6 Months</span>
          </div>
          <MonthlyExpenseChart data={monthlyHistory} currency={currency} height={260} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Expenses by Category</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Month</span>
          </div>
          <ExpensePieChart data={categoryBreakdown} currency={currency} height={260} />
        </div>
      </div>

      {/* 3. Budget vs Actual & Spending Trend (Section 20) */}
      <div className="dashboard-grid-equal">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Spending Trend Over Time</h3>
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
          <SpendingTrendChart data={spendingTrend} currency={currency} height={250} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Budget vs Actual</h3>
            <Link to="/budgets" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Manage Budgets
            </Link>
          </div>
          <BudgetComparisonChart data={budgetComparison} currency={currency} height={250} />
        </div>
      </div>

      {/* 4. Active Savings Goals Preview (Section 25) */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Savings Goals</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track what you are saving up for</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsGoalModalOpen(true)}>
              <Plus size={15} /> New Goal
            </button>
            <Link to="/savings" className="btn btn-outline btn-sm">
              View All Goals
            </Link>
          </div>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You haven't set any savings goals yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setIsGoalModalOpen(true)}>
              + Create First Savings Goal
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {savingsGoals.slice(0, 3).map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onContribute={(g) => setGoalToContribute(g)}
                onEdit={(g) => { setGoalToEdit(g); setIsGoalModalOpen(true); }}
                onDelete={(g) => setGoalToDelete(g)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Recent Expenses Table (Section 22) */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Expenses</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your latest transactions</p>
          </div>
          <Link to="/expenses" className="btn btn-secondary btn-sm">
            View All Expenses <ArrowRight size={14} />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No expenses tracked yet this month.
          </div>
        ) : (
          <ExpenseTable
            expenses={recentExpenses}
            onView={(exp) => setSelectedExpense(exp)}
            onEdit={(exp) => { setExpenseToEdit(exp); setIsExpenseModalOpen(true); }}
            onDelete={(exp) => setExpenseToDelete(exp)}
          />
        )}
      </div>

      {/* 6. Dynamic Smart Insights (Section 29) */}
      {insights.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-primary)" /> Dynamic Spending Insights
          </h3>
          <SmartInsightsList insights={insights} />
        </div>
      )}

      {/* Expense Modals */}
      {selectedExpense && (
        <ExpenseDetailModal
          isOpen={Boolean(selectedExpense)}
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onEdit={(exp) => { setSelectedExpense(null); setExpenseToEdit(exp); setIsExpenseModalOpen(true); }}
          onDelete={(exp) => { setSelectedExpense(null); setExpenseToDelete(exp); }}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseFormModal
          isOpen={isExpenseModalOpen}
          expenseToEdit={expenseToEdit}
          onClose={() => { setIsExpenseModalOpen(false); setExpenseToEdit(null); }}
          onSaved={() => {
            setIsExpenseModalOpen(false);
            setExpenseToEdit(null);
            fetchDashboardData();
          }}
        />
      )}

      {expenseToDelete && (
        <ConfirmDialog
          isOpen={Boolean(expenseToDelete)}
          title="Delete Expense?"
          message={`Are you sure you want to delete "${expenseToDelete.description}" (${formatCurrency(expenseToDelete.amount, currency)})?`}
          onClose={() => setExpenseToDelete(null)}
          onConfirm={handleDeleteExpenseConfirm}
        />
      )}

      {/* Budget Modals */}
      {isBudgetModalOpen && (
        <BudgetFormModal
          isOpen={isBudgetModalOpen}
          budgetToEdit={budgetToEdit}
          onClose={() => { setIsBudgetModalOpen(false); setBudgetToEdit(null); }}
          onSaved={() => {
            setIsBudgetModalOpen(false);
            setBudgetToEdit(null);
            fetchDashboardData();
          }}
        />
      )}

      {budgetToDelete && (
        <ConfirmDialog
          isOpen={Boolean(budgetToDelete)}
          title="Delete Budget?"
          message="Are you sure you want to remove this budget limit?"
          onClose={() => setBudgetToDelete(null)}
          onConfirm={handleDeleteBudgetConfirm}
        />
      )}

      {/* Savings Modals */}
      {isGoalModalOpen && (
        <SavingsFormModal
          isOpen={isGoalModalOpen}
          goalToEdit={goalToEdit}
          onClose={() => { setIsGoalModalOpen(false); setGoalToEdit(null); }}
          onSaved={() => {
            setIsGoalModalOpen(false);
            setGoalToEdit(null);
            fetchDashboardData();
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
            fetchDashboardData();
          }}
        />
      )}

      {goalToDelete && (
        <ConfirmDialog
          isOpen={Boolean(goalToDelete)}
          title="Delete Savings Goal?"
          message={`Are you sure you want to delete "${goalToDelete.name}"?`}
          onClose={() => setGoalToDelete(null)}
          onConfirm={handleDeleteGoalConfirm}
        />
      )}
    </div>
  );
};

export default DashboardPage;
