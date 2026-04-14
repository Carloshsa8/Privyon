export const initialSeedData = {
  transactions: [
    { id: '1', type: 'COMPRA', ticker: 'PETR4', name: 'Petróleo Brasileiro S.A. - Petrobras', class: 'Ações', date: '2026-10-15', quantity: 100, price: 35.50, broker: 'XP', fee: 0 },
    { id: '2', type: 'COMPRA', ticker: 'VALE3', name: 'Vale S.A.', class: 'Ações', date: '2026-11-20', quantity: 50, price: 68.20, broker: 'BTG', fee: 0 },
    { id: '3', type: 'COMPRA', ticker: 'ITUB4', name: 'Itaú Unibanco Holding S.A.', class: 'Ações', date: '2026-12-05', quantity: 200, price: 30.15, broker: 'XP', fee: 0 },
    { id: '4', type: 'COMPRA', ticker: 'MXRF11', name: 'Maxi Renda Fundo de Investimento Imobiliário', class: 'FIIs', date: '2026-10-10', quantity: 500, price: 10.50, broker: 'Nu Invest', fee: 0 },
    { id: '5', type: 'COMPRA', ticker: 'HGLG11', name: 'CGHG Logística', class: 'FIIs', date: '2026-11-01', quantity: 100, price: 158.30, broker: 'XP', fee: 0 },
    { id: '6', type: 'COMPRA', ticker: 'BOVA11', name: 'iShares Ibovespa Fundo de Índice', class: 'ETFs', date: '2027-01-15', quantity: 50, price: 125.40, broker: 'BTG', fee: 0 },
    { id: '7', type: 'COMPRA', ticker: 'BTC', name: 'Bitcoin', class: 'Criptomoedas', date: '2026-09-01', quantity: 0.05, price: 135000.00, broker: 'Mercado Bitcoin', fee: 0 },
    { id: '8', type: 'COMPRA', ticker: 'CDB', name: 'CDB Banco Master 115% CDI', class: 'Renda Fixa', date: '2026-08-15', quantity: 1, price: 10000.00, broker: 'XP', fee: 0 },
  ],
  earnings: [
    { id: '1', ticker: 'PETR4', date: '2026-12-20', type: 'Dividendo', valuePerShare: 1.25, quantity: 100, total: 125.00 },
    { id: '2', ticker: 'MXRF11', date: '2026-11-14', type: 'Rendimento', valuePerShare: 0.11, quantity: 500, total: 55.00 },
    { id: '3', ticker: 'MXRF11', date: '2026-12-14', type: 'Rendimento', valuePerShare: 0.11, quantity: 500, total: 55.00 },
    { id: '4', ticker: 'HGLG11', date: '2026-11-14', type: 'Rendimento', valuePerShare: 1.10, quantity: 100, total: 110.00 },
    { id: '5', ticker: 'HGLG11', date: '2026-12-14', type: 'Rendimento', valuePerShare: 1.10, quantity: 100, total: 110.00 },
  ],
  settings: {
    investorName: 'Investidor Padrão',
    currency: 'R$',
    theme: 'dark',
    hideValues: false,
    pixKey: '',
    btcAddress: ''
  }
};
