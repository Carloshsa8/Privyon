import { useMemo } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext';
import { usePriceApi } from './usePriceApi';

export const usePortfolio = () => {
  const { transactions, earnings } = usePortfolioContext();

  // Aggregate transactions by ticker to get position size and average cost
  const positions = useMemo(() => {
    const posMap = {};

    transactions.forEach(t => {
      if (!posMap[t.ticker]) {
        posMap[t.ticker] = {
          ticker: t.ticker,
          name: t.name,
          class: t.class,
          quantity: 0,
          totalInvested: 0,
          averagePrice: 0,
        };
      }

      const p = posMap[t.ticker];
      const val = t.price * t.quantity;

      if (t.type === 'COMPRA') {
        p.quantity += t.quantity;
        p.totalInvested += val;
      } else if (t.type === 'VENDA') {
        // Average price remains the same on sale, adjust invested proportion
        const shareToRemove = p.quantity > 0 ? (t.quantity / p.quantity) * p.totalInvested : 0;
        p.quantity -= t.quantity;
        p.totalInvested -= shareToRemove;
      }

      if (p.quantity > 0) {
        p.averagePrice = p.totalInvested / p.quantity;
      } else {
        p.averagePrice = 0;
        p.totalInvested = 0;
      }
    });

    // Remove closed positions (quantity 0)
    return Object.values(posMap).filter(p => p.quantity > 0);
  }, [transactions]);

  // Extract tickers for API call
  const activeTickers = useMemo(() => positions.map(p => p.ticker), [positions]);
  
  // Fetch real-time prices
  const { prices, loading, error } = usePriceApi(activeTickers);

  // Calculate current portfolio value and metrics
  const portfolioMetrics = useMemo(() => {
    let totalInvested = 0;
    let currentTotal = 0;
    let dayChangeTotal = 0;
    
    // Calculate total dividends received
    const totalEarnings = earnings.reduce((sum, e) => sum + e.total, 0);

    const enrichedPositions = positions.map(p => {
      totalInvested += p.totalInvested;
      
      // If we have live price, use it, otherwise fallback to average price (e.g. fixed income)
      const currentPrice = prices[p.ticker]?.price || p.averagePrice;
      const changePercent = prices[p.ticker]?.changePercent || 0;
      const changeVal = prices[p.ticker]?.change || 0;
      
      const currentValue = p.quantity * currentPrice;
      currentTotal += currentValue;
      dayChangeTotal += (p.quantity * changeVal);

      const rentabilityVal = currentValue - p.totalInvested;
      const rentabilityPct = p.totalInvested > 0 ? (rentabilityVal / p.totalInvested) * 100 : 0;

      return {
        ...p,
        currentPrice,
        currentValue,
        dayChangePercent: changePercent,
        dayChangeValue: changeVal * p.quantity,
        rentabilityValue: rentabilityVal,
        rentabilityPercent: rentabilityPct
      };
    });

    const totalRentabilityValue = currentTotal - totalInvested;
    const totalRentabilityPercent = totalInvested > 0 ? (totalRentabilityValue / totalInvested) * 100 : 0;
    const dayChangePercent = currentTotal - dayChangeTotal > 0 ? (dayChangeTotal / (currentTotal - dayChangeTotal)) * 100 : 0;

    // Calculate allocation by class
    const allocationByClass = enrichedPositions.reduce((acc, pos) => {
      acc[pos.class] = (acc[pos.class] || 0) + pos.currentValue;
      return acc;
    }, {});

    const allocationChartData = Object.entries(allocationByClass).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    // Calculate % of portfolio for each position
    enrichedPositions.forEach(p => {
      p.portfolioPercent = currentTotal > 0 ? (p.currentValue / currentTotal) * 100 : 0;
    });

    return {
      totalInvested,
      currentTotal,
      totalRentabilityValue,
      totalRentabilityPercent,
      dayChangeTotal,
      dayChangePercent,
      totalEarnings,
      enrichedPositions,
      allocationChartData,
      loadingPrices: loading,
    };
  }, [positions, prices, earnings, loading]);

  return portfolioMetrics;
};
