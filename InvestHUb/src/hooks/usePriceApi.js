import { useState, useEffect } from 'react';

// Using brapi.dev demo token for initial development
const BRAPI_TOKEN = 'demo';
const BRAPI_URL = 'https://brapi.dev/api';

export const usePriceApi = (tickers = []) => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      // Filter out non-B3 assets like Crypto or general Fixed Income for brapi
      const b3Tickers = tickers.filter(t => !['BTC', 'ETH', 'CDB', 'LCI', 'LCA'].includes(t) && t);
      
      if (b3Tickers.length === 0) return;

      setLoading(true);
      try {
        const queryOptions = b3Tickers.join(',');
        const response = await fetch(`${BRAPI_URL}/quote/${queryOptions}?token=${BRAPI_TOKEN}`);
        
        if (!response.ok) {
          throw new Error('Falha ao buscar preços B3');
        }

        const data = await response.json();
        const newPrices = {};
        
        if (data.results) {
           data.results.forEach(result => {
             newPrices[result.symbol] = {
               price: result.regularMarketPrice,
               changePercent: result.regularMarketChangePercent,
               change: result.regularMarketChange
             };
           });
        }
        
        setPrices(prev => ({...prev, ...newPrices}));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching brapi prices:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCryptoPrices = async () => {
      const cryptoTickers = tickers.filter(t => ['BTC', 'ETH', 'SOL'].includes(t));
      if (cryptoTickers.length === 0) return;

      const idsMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana'
      };

      const ids = cryptoTickers.map(t => idsMap[t]).join(',');

      try {
         const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl&include_24hr_change=true`);
         if (!response.ok) throw new Error('Falha ao buscar preços Cripto');
         
         const data = await response.json();
         const newPrices = {};
         
         Object.keys(idsMap).forEach(ticker => {
           const cgId = idsMap[ticker];
           if (data[cgId]) {
             newPrices[ticker] = {
               price: data[cgId].brl,
               changePercent: data[cgId].brl_24h_change || 0,
               change: (data[cgId].brl * (data[cgId].brl_24h_change || 0)) / 100
             };
           }
         });

         setPrices(prev => ({...prev, ...newPrices}));
      } catch (err) {
         console.error("Error fetching crypto prices:", err);
      }
    };

    if (tickers.length > 0) {
      fetchPrices();
      fetchCryptoPrices();
      
      // Auto update every 5 minutes
      const intervalId = setInterval(() => {
        fetchPrices();
        fetchCryptoPrices();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [JSON.stringify(tickers)]); // Rely on stringified array to avoid deep comparison issues

  return { prices, loading, error };
};

export const searchAssets = async (query) => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(`${BRAPI_URL}/quote/list?search=${query}&token=${BRAPI_TOKEN}&limit=10`);
    const data = await response.json();
    return data.stocks || [];
  } catch (err) {
    console.error("Error searching assets:", err);
    return [];
  }
};
