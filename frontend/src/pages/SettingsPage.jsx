import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Moon, Sun, Bell, Shield, Wallet, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('teenspend_notifications');
    return saved ? JSON.parse(saved) : { budgetAlerts: true, weeklyReport: true };
  });

  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('teenspend_privacy');
    return saved ? JSON.parse(saved) : { shareAnalytics: false, hideAmounts: false };
  });

  const [savedMessage, setSavedMessage] = useState('');

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('teenspend_notifications', JSON.stringify(updated));
    showSaved();
  };

  const handlePrivacyToggle = (key) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    localStorage.setItem('teenspend_privacy', JSON.stringify(updated));
    showSaved();
  };

  const showSaved = () => {
    setSavedMessage('Settings updated!');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Personalize your app appearance, notifications, and privacy</p>
        </div>
      </div>

      {savedMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem', background: 'var(--status-success-bg)', color: 'var(--status-success)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Theme Settings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {theme === 'light' ? <Sun size={20} color="var(--accent-amber)" /> : <Moon size={20} color="var(--accent-primary)" />}
          Appearance & Theme
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Dark Theme</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Currently using {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} color="var(--accent-teal)" />
          Notification Preferences
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Budget Alert Notifications</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alert when spending exceeds 80% of a category limit</div>
          </div>
          <input
            type="checkbox"
            checked={notifications.budgetAlerts}
            onChange={() => handleNotificationToggle('budgetAlerts')}
            style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Weekly Habit Summary</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive spending trend updates at the end of each week</div>
          </div>
          <input
            type="checkbox"
            checked={notifications.weeklyReport}
            onChange={() => handleNotificationToggle('weeklyReport')}
            style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="var(--accent-pink)" />
          Privacy & Security
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Strict Data Isolation</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your expenses and budgets are encrypted and isolated per user</div>
          </div>
          <span className="badge badge-success">Active</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Anonymous Insights Optimization</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Help improve teenage financial coaching heuristics anonymously</div>
          </div>
          <input
            type="checkbox"
            checked={privacy.shareAnalytics}
            onChange={() => handlePrivacyToggle('shareAnalytics')}
            style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
