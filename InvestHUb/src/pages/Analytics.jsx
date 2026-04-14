import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioContext } from '../context/PortfolioContext';
import { formatCurrency, formatPercent, generateColors } from '../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Sector } from 'recharts';
import { Briefcase, Scale, Activity } from 'lucide-react';

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-xl font-bold">
        {payload.ticker}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#888" className="text-sm">
        {formatPercent(percent * 100)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 15}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

const Analytics = () => {
  const { enrichedPositions } = usePortfolio();
  const { settings, transactions } = usePortfolioContext();
  const hidden = settings?.hideValues;
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);
  const [activeBrokerIndex, setActiveBrokerIndex] = useState(0);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Broker Allocation Data
  const brokerData = useMemo(() => {
    const brokerMap = {};
    const tickerToBroker = {};
    transactions.forEach(t => {
      tickerToBroker[t.ticker] = t.broker;
    });

    enrichedPositions.forEach(p => {
      const broker = tickerToBroker[p.ticker] || 'Outro';
      brokerMap[broker] = (brokerMap[broker] || 0) + p.currentValue;
    });

    return Object.entries(brokerMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [enrichedPositions, transactions]);

  // Sort positions by portfolio weight for one chart
  const weightData = [...enrichedPositions]
    .sort((a, b) => b.portfolioPercent - a.portfolioPercent)
    .slice(0, 10);

  // Sort positions by rentability % for another chart
  const rentabilityData = [...enrichedPositions]
    .sort((a, b) => b.rentabilityPercent - a.rentabilityPercent);

  const colors = generateColors(12);
  
  const CustomTooltipRent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isPos = val >= 0;
      return (
        <div className="bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-md p-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-base">{payload[0].payload.ticker}</p>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${isPos ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(val)}
            </span>
          </div>
          {!hidden && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              Lucro/Prej: <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(payload[0].payload.rentabilityValue)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Gráficos Analíticos</h1>
        <div className="text-xs px-3 py-1 bg-light-accent/10 text-light-accent dark:bg-dark-accent/10 dark:text-dark-accent rounded-full font-bold uppercase tracking-wider">Visualização Premium</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 10 by Weight - Premium Donut */}
        <div className="card w-full h-[500px] flex flex-col hover:shadow-2xl transition-all duration-500">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">Top 10 Ativos (% da Carteira)</h3>
             <Scale size={18} className="text-gray-400" />
          </div>
          <div className="flex-1 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeAssetIndex}
                  activeShape={renderActiveShape}
                  data={weightData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? "50%" : "60%"}
                  outerRadius={isMobile ? "65%" : "75%"}
                  dataKey="portfolioPercent"
                  onMouseEnter={(_, index) => setActiveAssetIndex(index)}
                  paddingAngle={4}
                  stroke="none"
                >
                  {weightData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Broker Allocation */}
        <div className="card w-full h-[500px] flex flex-col hover:shadow-2xl transition-all duration-500">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">Alocação por Corretora</h3>
             <Briefcase size={18} className="text-gray-400" />
          </div>
          <div className="flex-1 w-full min-w-0 font-sans">
            <div className="h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeBrokerIndex}
                    activeShape={renderActiveShape}
                    data={brokerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? "50%" : "60%"}
                    outerRadius={isMobile ? "65%" : "75%"}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveBrokerIndex(index)}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {brokerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[(index + 4) % colors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Rentability by Asset */}
        <div className="card lg:col-span-2 w-full h-[500px] flex flex-col hover:shadow-2xl transition-all duration-500">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg">Rentabilidade por Ativo (%)</h3>
             <Activity size={18} className="text-gray-400" />
          </div>
          <div className="flex-1 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentabilityData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={settings.accentColor || "#00D26A"} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={settings.accentColor || "#00D26A"} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.1} />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{fill: '#8b949e', fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis dataKey="ticker" type="category" width={70} tick={{fill: '#8b949e', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipRent />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="rentabilityPercent" radius={[0, 10, 10, 0]} barSize={20} animationDuration={2000} animationBegin={200}>
                  {
                    rentabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rentabilityPercent >= 0 ? "url(#colorPos)" : "url(#colorNeg)"} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
