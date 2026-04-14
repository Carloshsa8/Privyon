import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext';

const SummaryCard = ({ title, value, subValue, icon: Icon, isPositive, isLoading, to, onClick }) => {
  const { settings } = usePortfolioContext();
  const hidden = settings?.hideValues;

  const displayValue = hidden ? 'R$ ****' : value;
  const displaySubValue = hidden && subValue ? '****' : subValue;

  const content = (
    <div className={`card p-3 lg:p-6 transition-transform duration-300 ${to || onClick ? 'hover:-translate-y-1 cursor-pointer hover:shadow-md' : ''}`}>
      <div className="flex justify-between items-start gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] lg:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 truncate">{title}</p>
          {isLoading ? (
            <div className="h-6 lg:h-8 w-20 lg:w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
          ) : (
            <h3 className="text-base lg:text-3xl font-bold mb-1 lg:mb-2 tracking-tight truncate">{displayValue || value}</h3>
          )}
          
          {subValue !== undefined && !isLoading && (
            <div className={`flex items-center text-[10px] lg:text-sm font-medium ${
              isPositive === true ? 'text-green-500' : 
              isPositive === false ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {isPositive === true && <ArrowUpRight size={12} className="mr-0.5 lg:mr-1" />}
              {isPositive === false && <ArrowDownRight size={12} className="mr-0.5 lg:mr-1" />}
              <span className="truncate">{displaySubValue}</span>
            </div>
          )}
          
          {subValue !== undefined && isLoading && (
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          )}
        </div>
        
        <div className="p-2 lg:p-3 bg-gray-50 dark:bg-[#21262d] rounded-lg lg:rounded-xl flex-shrink-0">
          <Icon className="text-light-accent dark:text-dark-accent h-4 w-4 lg:h-6 lg:w-6" />
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick} className="block">{content}</div>;
  }

  return content;
};

export default SummaryCard;
