import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext';
import AssetAutocomplete from '../components/Forms/AssetAutocomplete';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Edit2, Trash2, PlusCircle, X } from 'lucide-react';
import FloatingActionButton from '../components/Common/FloatingActionButton';
import DateInput from '../components/Forms/DateInput';
import BrokerSelector from '../components/Forms/BrokerSelector';
import ModernSelector from '../components/Forms/ModernSelector';

const Transactions = () => {
  const { transactions, addTransaction, deleteTransaction, updateTransaction, settings } = usePortfolioContext();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    type: 'COMPRA',
    ticker: '',
    name: '',
    class: 'Ações',
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price: 0,
    broker: settings?.defaultBroker || 'XP',
    fee: 0,
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (location.state?.prefillTicker) {
      setFormData({
        ...initialFormState,
        ticker: location.state.prefillTicker,
        type: location.state.action || 'COMPRA'
      });
      setEditingId(null);
      setShowForm(true);
      // clean state to prevent reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const classes = ['Ações', 'FIIs', 'ETFs', 'BDRs', 'Renda Fixa', 'Criptomoedas', 'Internacional', 'Outro'];
  const brokers = ['XP', 'Clear', 'Rico', 'BTG', 'Nu Invest', 'Inter', 'Toro', 'Íon Itaú', 'Ágora', 'Outro'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateTransaction(editingId, formData);
    } else {
      addTransaction(formData);
    }
    setShowForm(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (t) => {
    setFormData(t);
    setEditingId(t.id);
    setShowForm(true);
  };

  const hidden = settings?.hideValues;

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const isAsc = sortConfig.direction === 'asc';
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    if (sortConfig.key === 'total') {
      valA = a.quantity * a.price;
      valB = b.quantity * b.price;
    }

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return isAsc ? -1 : 1;
    if (valA > valB) return isAsc ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ title, sortKey, align = 'left' }) => (
    <th 
      className={`pb-3 px-2 md:px-3 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors group text-${align}`}
      onClick={(e) => { e.stopPropagation(); handleSort(sortKey); }}
    >
      <div className={`flex items-center gap-1 font-medium whitespace-nowrap ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
        {title}
        <span className={`text-[10px] ml-1 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 
          ${sortConfig.key === sortKey ? 'text-light-accent dark:text-dark-accent opacity-100' : 'opacity-50'}`}>
          {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </div>
    </th>
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500 pb-28 md:pb-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Lançamentos</h1>
        <button 
          onClick={() => { setFormData(initialFormState); setEditingId(null); setShowForm(true); }}
          className="flex-1 lg:flex-none btn-primary flex items-center justify-center gap-2 py-3 lg:px-8"
        >
          <PlusCircle size={20} />
          <span className="font-bold">Nova Operação</span>
        </button>
      </div>

      <FloatingActionButton 
        onClick={() => { setFormData(initialFormState); setEditingId(null); setShowForm(true); }} 
        title="Nova Operação"
      />

      {showForm && (
        <div className="card border-l-4 border-l-light-accent dark:border-l-dark-accent">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">{editingId ? 'Editar Operação' : 'Nova Operação'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernSelector 
                label="Tipo de Operação"
                value={formData.type}
                options={['COMPRA', 'VENDA']}
                onChange={(val) => setFormData({ ...formData, type: val })}
              />

              <ModernSelector 
                label="Classe"
                value={formData.class}
                options={['Ações', 'FIIs', 'ETFs', 'BDRs', 'Renda Fixa', 'Criptomoedas', 'Internacional', 'Outro']}
                onChange={(val) => setFormData({ ...formData, class: val })}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Ticker</label>
              <AssetAutocomplete 
                value={formData.ticker}
                onChange={(val) => setFormData({...formData, ticker: val})}
                onSelect={(ticker, name) => setFormData({...formData, ticker, name})}
              />
            </div>

            <div className="col-span-1 md:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Nome do Ativo</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Petrobras"
              />
            </div>



            <DateInput 
              label="Data"
              required
              value={formData.date}
              onChange={val => setFormData({...formData, date: val})}
            />

            <BrokerSelector 
              value={formData.broker} 
              onChange={val => setFormData({...formData, broker: val})} 
            />

            <div>
              <label className="block text-sm font-medium mb-1">Quantidade</label>
              <input 
                type="number" 
                required min="0.00000001" step="any"
                className="input-field" 
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || ''})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Preço Unitário (R$)</label>
              <input 
                type="number" 
                required min="0" step="any"
                className="input-field" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || ''})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Taxas/Corretagem (R$)</label>
              <input 
                type="number" 
                min="0" step="any"
                className="input-field" 
                value={formData.fee}
                onChange={e => setFormData({...formData, fee: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Notas</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Anotações opcionais"
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Salvar Operação</button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop View */}
      <div className="card hidden lg:block overflow-x-auto shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Histórico de Operações</h3>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
              <SortableHeader title="Data" sortKey="date" />
              <SortableHeader title="Tipo" sortKey="type" />
              <SortableHeader title="Ativo" sortKey="ticker" />
              <SortableHeader title="Qtd" sortKey="quantity" align="right" />
              <SortableHeader title="Preço" sortKey="price" align="right" />
              <SortableHeader title="Total" sortKey="total" align="right" />
              <th className="pb-3 px-3 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((t) => (
              <tr 
                key={t.id} 
                onClick={() => handleEdit(t)}
                className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors group cursor-pointer"
              >
                <td className="py-3 px-3 whitespace-nowrap">{formatDate(t.date)}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'COMPRA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold">{t.ticker}</td>
                <td className="py-3 px-3 text-right">{t.quantity}</td>
                <td className="py-3 px-3 text-right">{hidden ? '****' : formatCurrency(t.price)}</td>
                <td className="py-3 px-3 text-right font-medium">{hidden ? '****' : formatCurrency(t.quantity * t.price)}</td>
                <td className="py-3 px-3">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(t); }}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(window.confirm('Excluir esta operação?')) deleteTransaction(t.id); }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedTransactions.map((t) => (
          <div 
            key={t.id}
            className="card p-4 active:scale-[0.98] transition-transform"
            onClick={() => handleEdit(t)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${t.type === 'COMPRA' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                  {t.type === 'COMPRA' ? 'C' : 'V'}
                </div>
                <div>
                  <h3 className="font-bold text-base">{t.ticker}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">{formatDate(t.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-base">{hidden ? '****' : formatCurrency(t.quantity * t.price)}</p>
                <p className="text-[10px] text-gray-400 font-medium">{t.quantity} un. @ {hidden ? '****' : formatCurrency(t.price)}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800/50">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lançado via Web</span>
               <div className="flex gap-4">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="text-gray-400 hover:text-light-accent dark:hover:text-dark-accent p-1"><Edit2 size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Excluir?')) deleteTransaction(t.id); }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {sortedTransactions.length === 0 && (
        <div className="py-12 text-center text-gray-500">Nenhuma transação registrada.</div>
      )}
    </div>
  );
};

export default Transactions;
