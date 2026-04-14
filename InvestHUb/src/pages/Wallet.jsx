import React, { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioContext } from '../context/PortfolioContext';
import { Search, ArrowUpDown, Filter, ChevronDown, ChevronUp, PlusCircle, Activity, Trash } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';

const Wallet = () => {
  const { enrichedPositions, loadingPrices } = usePortfolio();
  const { settings, transactions, deleteTransaction } = usePortfolioContext();
  const hidden = settings?.hideValues;

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('Todas');
  const [sortConfig, setSortConfig] = useState({ key: 'portfolioPercent', direction: 'desc' });
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  const classes = ['Todas', ...new Set(enrichedPositions.map(p => p.class))];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleRow = (ticker, e) => {
    // Evita expandir se clicar diretamente em botões ou links da tabela (se houver)
    if(e.target.closest('.action-btn')) return;
    setExpandedRow(prev => prev === ticker ? null : ticker);
  };

  const filteredData = enrichedPositions.filter(pos => {
    const matchesSearch = pos.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pos.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'Todas' || pos.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const isAsc = sortConfig.direction === 'asc';
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return isAsc ? -1 : 1;
    if (valA > valB) return isAsc ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ title, sortKey }) => (
    <th 
      className="pb-3 px-3 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1 font-medium whitespace-nowrap">
        {title}
        <ArrowUpDown size={14} className={`text-gray-300 dark:text-gray-600 group-hover:text-gray-500 
          ${sortConfig.key === sortKey ? 'text-light-accent dark:text-dark-accent opacity-100' : 'opacity-50'}`} />
      </div>
    </th>
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Minha Carteira</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar ticker ou nome" 
              className="input-field pl-10 w-full sm:w-64 border-gray-200 dark:border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              className="input-field pl-10 cursor-pointer appearance-none border-gray-200 dark:border-gray-700"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="card shadow-sm hidden lg:block overflow-x-auto">
        {loadingPrices && <div className="text-sm text-gray-500 mb-4 animate-pulse px-2">Atualizando cotações...</div>}
        
        <table className="w-full text-left border-collapse min-w-[700px] md:min-w-[1000px]">
          <thead>
            <tr className="border-b-2 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-wider">
              <th className="w-8"></th>
              <SortableHeader title="Ativo" sortKey="ticker" />
              <SortableHeader title="Classe" sortKey="class" />
              <SortableHeader title="Preço Atual" sortKey="currentPrice" />
              <SortableHeader title="Variação" sortKey="dayChangePercent" />
              <SortableHeader title="Rentabilidade" sortKey="rentabilityPercent" />
              <th className="hidden md:table-cell"><SortableHeader title="V. Investido" sortKey="totalInvested" /></th>
              <SortableHeader title="V. Atual" sortKey="currentValue" />
              <th className="hidden lg:table-cell"><SortableHeader title="% Carteira" sortKey="portfolioPercent" /></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((pos) => {
              const rPos = pos.rentabilityPercent >= 0;
              const dPos = pos.dayChangePercent >= 0;
              const isExpanded = expandedRow === pos.ticker;
              
              const recentHistory = transactions
                .filter(t => t.ticker === pos.ticker)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);
              
              return (
                <React.Fragment key={pos.ticker}>
                  <tr 
                    onClick={(e) => toggleRow(pos.ticker, e)}
                    className={`border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#1f242c] transition-colors cursor-pointer group ${isExpanded ? 'bg-gray-50 dark:bg-[#1f242c]' : ''}`}
                  >
                    <td className="py-3 px-2 text-gray-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </td>
                    <td className="py-3 px-2 md:px-3">
                      <div className="font-bold text-sm md:text-[15px]">{pos.ticker}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[100px] md:max-w-[150px]" title={pos.name}>{pos.name}</div>
                    </td>
                    <td className="py-3 px-2 md:px-3 text-xs md:text-sm">{pos.class}</td>
                    <td className="py-3 px-2 md:px-3 font-medium text-xs md:text-base">{hidden ? '****' : formatCurrency(pos.currentPrice)}</td>
                    
                    <td className={`py-3 px-2 md:px-3 text-xs md:text-sm font-bold ${dPos ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercent(pos.dayChangePercent)}
                    </td>
                    
                    <td className={`py-3 px-2 md:px-3 text-xs md:text-sm font-bold ${rPos ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercent(pos.rentabilityPercent)}
                    </td>
                    
                    <td className="py-3 px-2 md:px-3 text-xs text-gray-600 dark:text-gray-300 hidden md:table-cell">{hidden ? '****' : formatCurrency(pos.totalInvested)}</td>
                    <td className="py-3 px-2 md:px-3 font-bold text-sm md:text-[15px]">{hidden ? '****' : formatCurrency(pos.currentValue)}</td>
                    <td className="py-3 px-2 md:px-3 text-xs md:text-sm font-medium hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                         <span className="w-12 text-right">{formatPercent(pos.portfolioPercent)}</span>
                         <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                            <div className="h-full bg-light-accent dark:bg-dark-accent rounded-full transition-all duration-300" style={{width: `${pos.portfolioPercent}%`}}></div>
                         </div>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row Content (Desktop) */}
                  {isExpanded && (
                    <tr className="bg-gray-50/80 dark:bg-[#1c2128] border-b-2 border-gray-100 dark:border-gray-800 shadow-inner">
                      <td colSpan="11" className="p-0">
                         <div className="p-6 pl-12 flex flex-col lg:flex-row gap-8 animate-in slide-in-from-top-2 duration-300">
                           
                           {/* Quick Actions */}
                           <div className="flex flex-col gap-3 min-w-[200px]">
                             <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ações Rápidas</p>
                             <button
                               className="action-btn flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
                               onClick={() => navigate('/transactions', { state: { prefillTicker: pos.ticker, action: 'COMPRA' } })}
                             >
                               <PlusCircle size={18} className="text-green-500" />
                               Comprar / Lançar
                             </button>
                             <button
                               className="action-btn flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
                               onClick={() => navigate('/transactions', { state: { prefillTicker: pos.ticker, action: 'VENDA' } })}
                             >
                               <Activity size={18} className="text-red-500" />
                               Vender Ativo
                             </button>
                           </div>

                           {/* Recent History */}
                           <div className="flex-1">
                             <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Últimas Movimentações</p>
                             <div className="space-y-2">
                               {recentHistory.map(t => (
                                 <div key={t.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-sm group/item">
                                   <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${t.type === 'COMPRA' ? 'bg-light-accent/10 text-light-accent dark:text-dark-accent' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                       {t.type === 'COMPRA' ? <PlusCircle size={18} /> : <Trash2 size={18} />}
                                     </div>
                                     <span className="text-gray-500">{formatDate(t.date)}</span>
                                     <span className="font-bold">{t.quantity} un.</span>
                                     <span className="text-gray-400">@</span>
                                     <span>{hidden ? '****' : formatCurrency(t.price)}</span>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loadingPrices && <div className="text-xs text-gray-500 animate-pulse text-center mb-2">Atualizando cotações...</div>}
        
        {sortedData.map((pos) => {
          const rPos = pos.rentabilityPercent >= 0;
          const isExpanded = expandedRow === pos.ticker;
          
          return (
            <div 
              key={pos.ticker}
              className={`card p-4 transition-all duration-300 ${isExpanded ? 'ring-2 ring-light-accent dark:ring-dark-accent bg-white dark:bg-[#1c2128]' : ''}`}
              onClick={(e) => toggleRow(pos.ticker, e)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-light-accent dark:text-dark-accent">
                    {pos.ticker.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{pos.ticker}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{pos.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg leading-tight">{hidden ? '****' : formatCurrency(pos.currentPrice)}</p>
                  <div className="flex items-center justify-end gap-1">
                     <span className={`text-xs font-bold ${pos.dayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pos.dayChangePercent >= 0 ? '+' : ''}{formatPercent(pos.dayChangePercent)}
                     </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100 dark:border-gray-800/50">
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Patrimônio</p>
                  <p className="font-bold text-sm">{hidden ? '****' : formatCurrency(pos.currentValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Rentabilidade</p>
                  <p className={`font-bold text-sm ${rPos ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(pos.rentabilityPercent)}
                  </p>
                </div>
              </div>

              {isExpanded && (
                <div className="pt-4 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent rounded-xl text-xs font-bold transition-all active:scale-95"
                    onClick={(e) => { e.stopPropagation(); navigate('/transactions', { state: { prefillTicker: pos.ticker, action: 'COMPRA' } }) }}
                  >
                    <PlusCircle size={14} />
                    COMPRAR
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all active:scale-95"
                    onClick={(e) => { e.stopPropagation(); navigate('/transactions', { state: { prefillTicker: pos.ticker, action: 'VENDA' } }) }}
                  >
                    <Activity size={14} />
                    VENDER
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedData.length === 0 && (
        <div className="py-12 text-center text-gray-500">Nenhum ativo encontrado para os filtros atuais.</div>
      )}
    </div>
  );
};

export default Wallet;
