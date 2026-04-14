import React, { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioContext } from '../context/PortfolioContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { formatPercent } from '../utils/formatters';

const Benchmarks = () => {
  const { totalRentabilityPercent } = usePortfolio();
  const { settings } = usePortfolioContext();
  const hidden = settings?.hideValues;

  const [period, setPeriod] = useState('12M');
  const [toggles, setToggles] = useState({
    cdi: true,
    selic: true,
    ibov: true,
    ipca: false // off by default for cleaner look
  });

  const handleToggle = (key) => setToggles(prev => ({...prev, [key]: !prev[key]}));

  // Static/Mocked data for Benchmark comparisons
  const benchmarkDataMap = {
    '6M': [
      { name: 'Mês 1', cdi: 1.0, selic: 1.0, ibov: -2.0, ipca: 0.5, carteira: 1.2 },
      { name: 'Mês 2', cdi: 2.0, selic: 2.1, ibov: 1.5, ipca: 1.2, carteira: 3.5 },
      { name: 'Mês 3', cdi: 3.0, selic: 3.2, ibov: 4.0, ipca: 1.6, carteira: 5.1 },
      { name: 'Mês 4', cdi: 4.0, selic: 4.3, ibov: 3.5, ipca: 2.0, carteira: 6.8 },
      { name: 'Mês 5', cdi: 4.9, selic: 5.4, ibov: 6.2, ipca: 2.3, carteira: 8.5 },
      { name: 'Mês 6', cdi: 5.8, selic: 6.5, ibov: 8.5, ipca: 2.8, carteira: totalRentabilityPercent },
    ],
    '12M': [
      { name: 'Jan', cdi: 1.0, selic: 1.0, ibov: 5.0, ipca: 0.5, carteira: 2.5 },
      { name: 'Fev', cdi: 2.0, selic: 2.1, ibov: 3.0, ipca: 1.0, carteira: 3.8 },
      { name: 'Mar', cdi: 3.1, selic: 3.2, ibov: 1.0, ipca: 1.5, carteira: 4.0 },
      { name: 'Abr', cdi: 4.0, selic: 4.3, ibov: 4.5, ipca: 2.1, carteira: 6.5 },
      { name: 'Mai', cdi: 5.1, selic: 5.4, ibov: 6.0, ipca: 2.5, carteira: 8.2 },
      { name: 'Jun', cdi: 6.0, selic: 6.5, ibov: 4.0, ipca: 3.0, carteira: 7.5 },
      { name: 'Jul', cdi: 7.0, selic: 7.6, ibov: 7.5, ipca: 3.3, carteira: 9.8 },
      { name: 'Ago', cdi: 8.1, selic: 8.7, ibov: 6.0, ipca: 3.5, carteira: 8.5 },
      { name: 'Set', cdi: 9.0, selic: 9.8, ibov: 8.0, ipca: 3.8, carteira: 11.0 },
      { name: 'Out', cdi: 10.0, selic: 10.9, ibov: 12.0, ipca: 4.1, carteira: 14.5 },
      { name: 'Nov', cdi: 11.0, selic: 12.0, ibov: 15.0, ipca: 4.3, carteira: 18.2 },
      { name: 'Dez', cdi: 12.0, selic: 13.25, ibov: 18.0, ipca: 4.6, carteira: totalRentabilityPercent },
    ]
  };

  const chartData = benchmarkDataMap[period];
  
  // Current values based on last point
  const lastPoint = chartData[chartData.length - 1];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if(hidden) return <div className="bg-white dark:bg-[#161B22] p-3 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg">****</div>;
      
      return (
        <div className="bg-white dark:bg-[#161B22] p-3 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry, index) => (
             <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                {entry.name}: {formatPercent(entry.value)}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Benchmarks</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Toggles */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#21262d] px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800">
             <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={toggles.cdi} onChange={() => handleToggle('cdi')} className="accent-blue-500 w-4 h-4" />
                CDI
             </label>
             <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={toggles.selic} onChange={() => handleToggle('selic')} className="accent-orange-500 w-4 h-4" />
                SELIC
             </label>
             <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={toggles.ibov} onChange={() => handleToggle('ibov')} className="accent-purple-500 w-4 h-4" />
                IBOV
             </label>
             <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={toggles.ipca} onChange={() => handleToggle('ipca')} className="accent-yellow-500 w-4 h-4" />
                IPCA
             </label>
          </div>

          <div className="flex bg-gray-100 dark:bg-[#21262d] p-1 rounded-lg">
             {['6M', '12M'].map(p => (
               <button
                 key={p}
                 onClick={() => setPeriod(p)}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${period === p ? 'bg-white dark:bg-[#30363d] shadow text-light-accent dark:text-dark-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
               >
                 {p}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card w-full h-[450px] flex flex-col">
        <h3 className="font-semibold text-lg mb-4">Rentabilidade Acumulada vs Indicadores</h3>
        <div className="flex-1 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" tick={{fill: '#8b949e'}} />
              <YAxis tickFormatter={(v) => hidden ? '****' : `${v}%`} tick={{fill: '#8b949e'}} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="carteira" name="Sua Carteira" stroke={settings.accentColor || "#00D26A"} strokeWidth={3} dot={{r: 4}} activeDot={{ r: 6 }} animationDuration={1000} />
              {toggles.cdi && <Line type="monotone" dataKey="cdi" name="CDI" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={1000} />}
              {toggles.selic && <Line type="monotone" dataKey="selic" name="SELIC" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="3 3" animationDuration={1000} />}
              {toggles.ibov && <Line type="monotone" dataKey="ibov" name="IBOVESPA" stroke="#8b5cf6" strokeWidth={2} dot={false} animationDuration={1000} />}
              {toggles.ipca && <Line type="monotone" dataKey="ipca" name="IPCA" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={1000} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      {/* Desktop Table View */}
      <div className="card hidden lg:block overflow-x-auto shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Comparativo Final ({period})</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
              <th className="pb-3 px-3 font-medium">Indicador</th>
              <th className="pb-3 px-3 font-medium text-right">Acumulado</th>
              <th className="pb-3 px-3 font-medium text-right">Diferença vs Carteira</th>
              <th className="pb-3 px-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Sua Carteira', value: lastPoint.carteira, color: 'text-light-accent dark:text-dark-accent font-bold', show: true },
              { name: 'CDI', value: lastPoint.cdi, show: toggles.cdi },
              { name: 'SELIC', value: lastPoint.selic, show: toggles.selic },
              { name: 'IBOVESPA', value: lastPoint.ibov, show: toggles.ibov },
              { name: 'IPCA', value: lastPoint.ipca, show: toggles.ipca }
            ].filter(ind => ind.show).map(ind => {
              const diff = lastPoint.carteira - ind.value;
              const isWin = diff > 0;
              
              return (
                <tr key={ind.name} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors">
                  <td className={`py-4 px-3 ${ind.color || 'font-medium'}`}>{ind.name}</td>
                  <td className={`py-4 px-3 text-right ${ind.color || ''}`}>{hidden ? '****' : formatPercent(ind.value)}</td>
                  <td className="py-4 px-3 text-right">
                    {ind.name === 'Sua Carteira' ? '-' : hidden ? '****' : (
                      <span className={isWin ? 'text-green-500' : 'text-red-500'}>
                        {isWin ? '+' : ''}{formatPercent(diff)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-center">
                     {ind.name === 'Sua Carteira' ? '-' : (
                       isWin ? 
                       <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-bold">GANHANDO</span> : 
                       <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-bold">PERDENDO</span>
                     )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        <h3 className="font-semibold text-lg px-1">Comparativo Final ({period})</h3>
        {[
          { name: 'Sua Carteira', value: lastPoint.carteira, color: 'text-light-accent dark:text-dark-accent font-bold', show: true },
          { name: 'CDI', value: lastPoint.cdi, show: toggles.cdi },
          { name: 'SELIC', value: lastPoint.selic, show: toggles.selic },
          { name: 'IBOVESPA', value: lastPoint.ibov, show: toggles.ibov },
          { name: 'IPCA', value: lastPoint.ipca, show: toggles.ipca }
        ].filter(ind => ind.show).map(ind => {
          const diff = lastPoint.carteira - ind.value;
          const isWin = diff > 0;
          
          return (
            <div key={ind.name} className="card p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${ind.name === 'Sua Carteira' ? 'bg-light-accent/10 dark:bg-dark-accent/10 border border-light-accent/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {ind.name.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-base ${ind.color || ''}`}>{ind.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Benchmark</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${ind.color || ''}`}>{hidden ? '****' : formatPercent(ind.value)}</p>
                  {ind.name !== 'Sua Carteira' && (
                    <p className={`text-xs font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                      {isWin ? '+' : ''}{formatPercent(diff)} vs Carteira
                    </p>
                  )}
                </div>
              </div>

              {ind.name !== 'Sua Carteira' && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800/50 flex justify-center">
                  {isWin ? (
                    <span className="w-full text-center py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold uppercase tracking-widest">Ganhando do Índice</span>
                  ) : (
                    <span className="w-full text-center py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest">Perdendo do Índice</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] md:text-xs text-gray-400 mt-4 italic text-center md:text-left px-2">* Dados de benchmark são aproximações (mock) para a versão atual. A integração com API real será feita futuramente.</p>
    </div>
  );
};

export default Benchmarks;
