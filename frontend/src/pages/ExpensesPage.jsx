import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseCard from '../components/expenses/ExpenseCard';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import ExpenseDetailModal from '../components/expenses/ExpenseDetailModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { Plus, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Online / Wallet', 'Other'];

const ExpensesPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const { refreshKey, triggerRefresh } = useOutletContext() || {};

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats || []);
    } catch {
      // Fallback
    }
  };

  const fetchExpenses = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        paymentMethod: selectedPaymentMethod || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy
      };

      const res = await expenseService.getExpenses(filters);
      setExpenses(res.expenses || []);
      setPagination(res.pagination || { page: 1, limit: 10, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses(1);
  }, [selectedCategory, selectedPaymentMethod, startDate, endDate, sortBy, refreshKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      triggerRefresh?.();
      fetchExpenses(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track, filter, and review every transaction</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setExpenseToEdit(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by description (e.g. McDonald's, Boba, Bus)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>
          {(search || selectedCategory || selectedPaymentMethod || startDate || endDate || sortBy !== 'newest') && (
            <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
          )}
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Payment Method</label>
            <select value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Expense List Content */}
      {loading ? (
        <LoadingState message="Loading your expenses..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchExpenses(1)} />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description={search || selectedCategory ? "No expenses match your search or filter criteria." : "Start tracking your first expense to understand your spending!"}
          actionLabel="+ Add Expense"
          onAction={() => { setExpenseToEdit(null); setIsModalOpen(true); }}
        />
      ) : (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Showing {expenses.length} of {pagination.totalCount} transactions</span>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          </div>

          {/* Desktop Table View */}
          <div className="table-responsive">
            <ExpenseTable
              expenses={expenses}
              onView={(exp) => setSelectedExpense(exp)}
              onEdit={(exp) => { setExpenseToEdit(exp); setIsModalOpen(true); }}
              onDelete={(exp) => setExpenseToDelete(exp)}
            />
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchExpenses(pagination.page - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchExpenses(pagination.page + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedExpense && (
        <ExpenseDetailModal
          isOpen={Boolean(selectedExpense)}
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onEdit={(exp) => { setSelectedExpense(null); setExpenseToEdit(exp); setIsModalOpen(true); }}
          onDelete={(exp) => { setSelectedExpense(null); setExpenseToDelete(exp); }}
        />
      )}

      {isModalOpen && (
        <ExpenseFormModal
          isOpen={isModalOpen}
          expenseToEdit={expenseToEdit}
          onClose={() => { setIsModalOpen(false); setExpenseToEdit(null); }}
          onSaved={() => {
            setIsModalOpen(false);
            setExpenseToEdit(null);
            triggerRefresh?.();
            fetchExpenses(pagination.page);
          }}
        />
      )}

      {expenseToDelete && (
        <ConfirmDialog
          isOpen={Boolean(expenseToDelete)}
          title="Delete Expense?"
          message={`Are you sure you want to delete "${expenseToDelete.description}" (${formatCurrency(expenseToDelete.amount, currency)})?`}
          onClose={() => setExpenseToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
