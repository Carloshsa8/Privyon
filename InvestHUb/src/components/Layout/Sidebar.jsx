import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, WalletCards, ArrowRightLeft, LineChart, Coins, Scale, Settings } from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Carteira', icon: <WalletCards size={20} />, path: '/wallet' },
    { name: 'Lançamentos', icon: <ArrowRightLeft size={20} />, path: '/transactions' },
    { name: 'Gráficos', icon: <LineChart size={20} />, path: '/analytics' },
    { name: 'Proventos', icon: <Coins size={20} />, path: '/earnings' },
    { name: 'Benchmarks', icon: <Scale size={20} />, path: '/benchmarks' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar sidebar bg-white dark:bg-[#161B22] border-r border-gray-100 dark:border-gray-800 */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 glass border-r border-gray-100/50 dark:border-gray-800/50
        transform transition-transform duration-300 ease-in-out z-50
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100/50 dark:border-gray-800/50">
          <AppLogo />
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => { if(window.innerWidth < 1024) toggleSidebar() }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'nav-item-active' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#21262d] hover:text-light-primary dark:hover:text-dark-primary'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-[15px]">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
