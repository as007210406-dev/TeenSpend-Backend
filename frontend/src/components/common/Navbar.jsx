import React from 'react';
import { Moon, Sun, Plus, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getCurrencySymbol } from '../../utils/formatters';

const Navbar = ({ onQuickAddExpense }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-tertiary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
          <Wallet size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Currency: {user?.currency || 'INR'} ({getCurrencySymbol(user?.currency || 'INR')})
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onQuickAddExpense && (
          <button className="btn btn-primary btn-sm" onClick={onQuickAddExpense}>
            <Plus size={16} /> Add Expense
          </button>
        )}

        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {user?.full_name ? user.full_name[0].toUpperCase() : 'T'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
