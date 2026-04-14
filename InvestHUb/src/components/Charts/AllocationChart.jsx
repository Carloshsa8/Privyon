import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { usePortfolioContext } from '../../context/PortfolioContext';

const AllocationChart = ({ data }) => {
  const { settings } = usePortfolioContext();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const accent = settings.accentColor || '#00D26A';
  const baseColors = [accent, '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];
  const isDark = settings.theme === 'dark';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#161B22] p-3 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{payload[0].name}</p>
          <p className="text-light-accent dark:text-dark-accent font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegendText = (value, entry) => {
    return <span className="text-gray-600 dark:text-gray-400 font-medium ml-1 text-xs md:text-sm">{value}</span>;
  };

  if(!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-400">Sem dados para exibir</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy={isMobile ? "40%" : "50%"}
          innerRadius={isMobile ? 60 : 80}
          outerRadius={isMobile ? 90 : 110}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={baseColors[index % baseColors.length]} 
              className="hover:opacity-80 transition-opacity duration-200 outline-none"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout={isMobile ? "horizontal" : "vertical"} 
          verticalAlign={isMobile ? "bottom" : "middle"} 
          align={isMobile ? "center" : "right"}
          formatter={renderLegendText}
          iconType="circle"
          iconSize={8}
          wrapperStyle={isMobile ? { paddingTop: '20px' } : { paddingLeft: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AllocationChart;
