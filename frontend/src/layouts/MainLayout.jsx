import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import MobileNavigation from '../components/common/MobileNavigation';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';

const MainLayout = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseSaved = () => {
    setIsQuickAddOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Navbar onQuickAddExpense={() => setIsQuickAddOpen(true)} />
        <main className="page-container animate-fade-in">
          <Outlet context={{ refreshKey, triggerRefresh: () => setRefreshKey(prev => prev + 1) }} />
        </main>
      </div>
      <MobileNavigation />

      {isQuickAddOpen && (
        <ExpenseFormModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSaved={handleExpenseSaved}
        />
      )}
    </div>
  );
};

export default MainLayout;
