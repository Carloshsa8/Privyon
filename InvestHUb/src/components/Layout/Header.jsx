import React from 'react';
import { Menu, Moon, Sun, User, Eye, EyeOff } from 'lucide-react';
import { usePortfolioContext } from '../../context/PortfolioContext';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const { settings, updateSettings } = usePortfolioContext();
  const isDark = settings.theme === 'dark';
  const isHidden = settings.hideValues;

  const currentHour = new Date().getHours();
  let greeting = 'Bom dia';
  if (currentHour >= 12 && currentHour < 18) greeting = 'Boa tarde';
  if (currentHour >= 18 || currentHour < 5) greeting = 'Boa noite';

  // Sync theme on mount and when settings change
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    
    const update = () => {
      updateSettings({ theme: newTheme });
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  };

  const toggleHideValues = () => {
    updateSettings({ hideValues: !isHidden });
  };

  return (
    <header className="h-16 glass flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden text-gray-500 dark:text-gray-400 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold hidden sm:block">
          <span className="text-gray-500 dark:text-gray-400 font-normal">{greeting}, </span>
          {settings.investorName}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleHideValues}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 active:scale-90"
          title={isHidden ? 'Mostrar Valores' : 'Ocultar Valores'}
        >
          {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 active:scale-90"
          title={`Mudar para ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-800">
          <Link to="/settings" className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:ring-2 ring-light-accent dark:ring-dark-accent transition-all cursor-pointer shadow-sm" title="Configurações">
            <User size={18} className="text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
