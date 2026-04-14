import React, { createContext, useState, useEffect, useContext } from 'react';
import { initialSeedData } from '../utils/seedData';

const PortfolioContext = createContext();

export const usePortfolioContext = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const localData = localStorage.getItem('investhub_data');
    const base = localData ? JSON.parse(localData) : initialSeedData;
    // Migrating settings for new features
    if (!base.settings.security) {
      base.settings.security = {
        pinEnabled: false,
        biometryEnabled: false,
        pinCode: '',
      };
    }
    if (!base.settings.defaultBroker) {
      base.settings.defaultBroker = 'XP';
    }
    
    // Migration: Update 2023 dates to 2026
    const migrateDates = (items) => items.map(item => ({
      ...item,
      date: item.date ? item.date.replace('2023-', '2026-') : item.date
    }));

    base.transactions = migrateDates(base.transactions || []);
    base.earnings = migrateDates(base.earnings || []);

    return base;
  });

  const [isLocked, setIsLocked] = useState(data.settings.security?.pinEnabled || data.settings.security?.biometryEnabled);
  const [isAppReady, setIsAppReady] = useState(false);

  const unlockApp = () => setIsLocked(false);
  const lockApp = () => {
    if (data.settings.security?.pinEnabled || data.settings.security?.biometryEnabled) {
      setIsLocked(true);
    }
  };

  // Helper to adjust color brightness (for light theme vs dark theme accents)
  const adjustBrightness = (hex, percent) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const nR = Math.min(255, Math.max(0, Math.floor(r * (1 + percent))));
    const nG = Math.min(255, Math.max(0, Math.floor(g * (1 + percent))));
    const nB = Math.min(255, Math.max(0, Math.floor(b * (1 + percent))));
    return `#${nR.toString(16).padStart(2, '0')}${nG.toString(16).padStart(2, '0')}${nB.toString(16).padStart(2, '0')}`;
  };

  const getRgbString = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  };

  useEffect(() => {
    localStorage.setItem('investhub_data', JSON.stringify(data));
    const accent = data.settings.accentColor || '#00D26A';
    const lightAccent = adjustBrightness(accent, -0.15);
    const rgb = getRgbString(accent);
    const lightRgb = getRgbString(lightAccent);
    
    // Set both HEX and RGB space-separated variables for maximum compatibility
    document.documentElement.style.setProperty('--accent-hex', accent);
    document.documentElement.style.setProperty('--accent-rgb', rgb);
    document.documentElement.style.setProperty('--dark-accent', rgb);
    document.documentElement.style.setProperty('--light-accent', lightRgb);
    
    // Force immediate class application if needed
    if (data.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data]);

  const addTransaction = (transaction) => {
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, { ...transaction, id: crypto.randomUUID() }]
    }));
  };

  const updateTransaction = (id, updatedTransaction) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updatedTransaction } : t))
    }));
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const addEarning = (earning) => {
    setData(prev => ({
      ...prev,
      earnings: [...prev.earnings, { ...earning, id: crypto.randomUUID() }]
    }));
  };

  const updateEarning = (id, updatedEarning) => {
    setData(prev => ({
      ...prev,
      earnings: prev.earnings.map(e => (e.id === id ? { ...e, ...updatedEarning } : e))
    }));
  };

  const deleteEarning = (id) => {
    setData(prev => ({
      ...prev,
      earnings: prev.earnings.filter(e => e.id !== id)
    }));
  };

  const updateSettings = (newSettings) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const resetData = () => {
    setData(initialSeedData);
  };

  const clearAllData = () => {
    setData({
      transactions: [],
      earnings: [],
      settings: {
        investorName: 'Novo Investidor',
        currency: 'R$',
        theme: 'dark',
        hideValues: false,
        accentColor: '#00D26A',
        pixKey: '',
        btcAddress: ''
      }
    });
  };

  const importData = (importedData) => {
    setData(importedData);
  };

  return (
    <PortfolioContext.Provider value={{ 
      ...data, 
      updateSettings, 
      addTransaction, 
      deleteTransaction, 
      updateTransaction, 
      addEarning, 
      deleteEarning,
      importData,
      clearAllData,
      isLocked,
      lockApp,
      unlockApp,
      isAppReady,
      setIsAppReady
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
