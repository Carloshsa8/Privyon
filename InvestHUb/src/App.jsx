import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PortfolioProvider, usePortfolioContext } from './context/PortfolioContext';
import { App as CapApp } from '@capacitor/app';

// Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import SplashScreen from './components/Common/SplashScreen';
import LockScreen from './components/Security/LockScreen';

// Pages
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Earnings from './pages/Earnings';
import Benchmarks from './pages/Benchmarks';
import Settings from './pages/Settings';

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { lockApp, isAppReady } = usePortfolioContext();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    // Listen for app state changes to lock the app when it goes to background
    const handleStateChange = (state) => {
      if (!state.isActive) {
        lockApp();
      }
    };

    const handler = CapApp.addListener('appStateChange', handleStateChange);
    
    return () => {
      handler.then(h => h.remove());
    };
  }, [lockApp]);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-200">
        <SplashScreen />
        <LockScreen />
        
        {/* Only show main content after splash, or keep it hidden behind overlays */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64 transition-all duration-300">
          <Header toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/benchmarks" element={<Benchmarks />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}

export default App;
