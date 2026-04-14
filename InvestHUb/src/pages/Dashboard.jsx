import React from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import SummaryCard from '../components/Dashboard/SummaryCard';
import AllocationChart from '../components/Charts/AllocationChart';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PiggyBank, Briefcase, Coins, Activity } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { usePortfolioContext } from '../context/PortfolioContext';

const Dashboard = () => {
  const { 
    totalInvested, 
    currentTotal, 
    totalRentabilityValue, 
    totalRentabilityPercent,
    dayChangeTotal,
    dayChangePercent,
    totalEarnings,
    enrichedPositions,
    allocationChartData,
    loadingPrices
  } = usePortfolio();

  const { settings } = usePortfolioContext();
  const hidden = settings?.hideValues;

  const isRentabilityPositive = totalRentabilityValue >= 0;
  const isDayPositive = dayChangeTotal >= 0;

  // Get Top 5 Rentability
  const topPerformers = [...enrichedPositions]
    .sort((a, b) => b.rentabilityPercent - a.rentabilityPercent)
    .slice(0, 5);

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500 pb-12 md:pb-8">
      
      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        <SummaryCard 
          title="Patrimônio Total" 
          value={formatCurrency(currentTotal)} 
          subValue={hidden ? '****' : `${formatPercent(dayChangePercent)} hoje`}
          icon={Wallet}
          isPositive={isDayPositive}
          isLoading={loadingPrices}
          to="/wallet"
        />
        <SummaryCard 
          title="Rentabilidade" 
          value={formatPercent(totalRentabilityPercent)} 
          subValue={hidden ? '****' : `${isRentabilityPositive ? '+' : ''}${formatCurrency(totalRentabilityValue)}`}
          icon={isRentabilityPositive ? TrendingUp : TrendingDown}
          isPositive={isRentabilityPositive}
          isLoading={loadingPrices}
          to="/analytics"
        />
        <SummaryCard 
          title="Total Investido" 
          value={formatCurrency(totalInvested)} 
          subValue="Custo de aquisição"
          icon={PiggyBank}
          isLoading={loadingPrices}
        />
        <SummaryCard 
          title="Proventos" 
          value={formatCurrency(totalEarnings)} 
          subValue="Total recebido"
          icon={Coins}
          to="/earnings"
        />
        <SummaryCard 
          title="Lucro Líquido" 
          value={formatCurrency(totalRentabilityValue)} 
          subValue="Sem proventos"
          icon={DollarSign}
          isPositive={isRentabilityPositive}
          isLoading={loadingPrices}
        />
        <SummaryCard 
          title={`Hoje (${formatDate(new Date().toISOString().split('T')[0]).substring(0, 5)})`}
          value={formatCurrency(dayChangeTotal)} 
          subValue={formatPercent(dayChangePercent)}
          icon={Activity}
          isPositive={isDayPositive}
          isLoading={loadingPrices}
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Chart */}
        <div className="card lg:col-span-1 min-h-[450px] flex flex-col hover:shadow-xl transition-shadow duration-300">
          <h3 className="font-bold text-lg mb-4">Alocação por Classe</h3>
          <div className="flex-1 w-full min-w-0">
            <AllocationChart data={allocationChartData} />
          </div>
        </div>

        {/* Top 5 Performers */}
        <div className="lg:col-span-2 card overflow-x-auto shadow-sm">
          <h3 className="font-bold text-lg mb-4">Ativos em Destaque</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 px-2">Ativo</th>
                <th className="pb-3 px-2 pt-0 hidden sm:table-cell">Classe</th>
                <th className="pb-3 px-2 text-right">Rent.</th>
                <th className="pb-3 px-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map(p => (
                <tr key={p.ticker} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-[#1c2128]/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="font-bold text-sm md:text-base">{p.ticker}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-medium lg:hidden">{p.class}</div>
                  </td>
                  <td className="py-4 px-2 text-xs md:text-sm text-gray-500 hidden sm:table-cell">{p.class}</td>
                  <td className={`py-4 px-2 text-right font-bold ${p.rentabilityPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(p.rentabilityPercent)}
                  </td>
                  <td className="py-4 px-2 font-bold text-right text-sm md:text-base">{hidden ? '****' : formatCurrency(p.currentValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
