import React, { useState } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Edit2, Trash2, PlusCircle, X, Coins, CalendarDays, TrendingUp } from 'lucide-react';
import AssetAutocomplete from '../components/Forms/AssetAutocomplete';
import FloatingActionButton from '../components/Common/FloatingActionButton';
import DateInput from '../components/Forms/DateInput';
import ModernSelector from '../components/Forms/ModernSelector';

const Earnings = () => {
  const { earnings, addEarning, updateEarning, deleteEarning } = usePortfolioContext();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    ticker: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Dividendo',
    valuePerShare: 0,
    quantity: 1,
    total: 0
  };

  const [formData, setFormData] = useState(initialFormState);

  // ... (totals calculation remains same)
  const totalEarnings = earnings.reduce((sum, e) => sum + e.total, 0);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const yearEarnings = earnings.filter(e => new Date(e.date).getFullYear() === currentYear)
                               .reduce((sum, e) => sum + e.total, 0);
                               
  const monthEarnings = earnings.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).reduce((sum, e) => sum + e.total, 0);

  // ... (prepare chart data remains same)
  const monthlyDataMap = {};
  earnings.forEach(e => {
    const d = new Date(e.date);
    if(d.getFullYear() === currentYear) {
      const monthStr = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      monthlyDataMap[monthStr] = (monthlyDataMap[monthStr] || 0) + e.total;
    }
  });

  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const chartData = months.map(m => ({
    name: m,
    total: monthlyDataMap[m] || 0
  }));

  const handleQuantityPriceChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    newData.total = (newData.valuePerShare || 0) * (newData.quantity || 0);
    setFormData(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(editingId) {
      updateEarning(editingId, formData);
    } else {
      addEarning(formData);
    }
    setShowForm(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (earning) => {
    setFormData(earning);
    setEditingId(earning.id);
    setShowForm(true);
  };

  const { settings } = usePortfolioContext();
  const hidden = settings?.hideValues;

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEarnings = [...earnings].sort((a, b) => {
    const isAsc = sortConfig.direction === 'asc';
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return isAsc ? -1 : 1;
    if (valA > valB) return isAsc ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ title, sortKey, align = 'left' }) => (
    <th 
      className={`pb-3 px-2 md:px-3 animate-transition cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors group text-${align}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1 font-medium whitespace-nowrap ${align === 'right' ? 'justify-end' : ''}`}>
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
        <h1 className="text-2xl font-bold">Proventos</h1>
        <button 
          onClick={() => { setFormData(initialFormState); setEditingId(null); setShowForm(true); }}
          className="btn-primary hidden lg:flex items-center justify-center gap-2"
        >
          <PlusCircle size={18} />
          <span>Novo Provento</span>
        </button>
      </div>

      <FloatingActionButton onClick={() => { setFormData(initialFormState); setEditingId(null); setShowForm(true); }} title="Novo Provento" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
             <Coins className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Histórico</p>
            <h3 className="text-2xl font-bold">{hidden ? '****' : formatCurrency(totalEarnings)}</h3>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
             <CalendarDays className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Ano ({currentYear})</p>
            <h3 className="text-2xl font-bold">{hidden ? '****' : formatCurrency(yearEarnings)}</h3>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
             <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Mês Atual</p>
            <h3 className="text-2xl font-bold">{hidden ? '****' : formatCurrency(monthEarnings)}</h3>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="card w-full h-[350px] flex flex-col">
        <h3 className="font-semibold text-lg mb-4">Recebimentos Mensais ({currentYear})</h3>
        <div className="flex-1 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" tick={{fill: '#8b949e', fontSize: 12}} />
              <YAxis tickFormatter={(v) => hidden ? '****' : `R$${v}`} tick={{fill: '#8b949e', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f3f4f6', opacity: 0.1}}
                contentStyle={{backgroundColor: 'var(--tw-colors-dark-card)', borderColor: 'var(--tw-colors-gray-800)', color: '#fff'}}
                formatter={(value) => hidden ? '****' : formatCurrency(value)}
              />
              <Bar dataKey="total" fill={settings.accentColor || "#00D26A"} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-l-4 border-l-light-accent dark:border-l-dark-accent">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">{editingId ? 'Editar Provento' : 'Novo Provento'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Ticker</label>
              <AssetAutocomplete 
                value={formData.ticker}
                onChange={(val) => setFormData({...formData, ticker: val})}
                onSelect={(ticker, name) => setFormData({...formData, ticker, name})}
              />
            </div>

            <DateInput 
              label="Data de Pagamento"
              required
              value={formData.date}
              onChange={val => setFormData({...formData, date: val})}
            />

            <ModernSelector 
              label="Tipo"
              value={formData.type}
              options={['Dividendo', 'JCP', 'Rendimento', 'Rest. Capital']}
              onChange={(val) => setFormData({ ...formData, type: val })}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Valor por Cota (R$)</label>
              <input 
                type="number" 
                required min="0.000001" step="any"
                className="input-field" 
                value={formData.valuePerShare}
                onChange={e => handleQuantityPriceChange('valuePerShare', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantidade de Cotas</label>
              <input 
                type="number" 
                required min="1" step="any"
                className="input-field" 
                value={formData.quantity}
                onChange={e => handleQuantityPriceChange('quantity', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Recebido (R$)</label>
              <input 
                type="number" 
                readOnly
                className="input-field bg-gray-100 dark:bg-gray-800" 
                value={Number(formData.total).toFixed(2)}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">{editingId ? 'Atualizar Provento' : 'Salvar Provento'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {/* Desktop Table View */}
      <div className="card hidden lg:block overflow-x-auto shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Histórico de Recebimentos</h3>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
              <SortableHeader title="Data" sortKey="date" />
              <SortableHeader title="Ativo" sortKey="ticker" />
              <SortableHeader title="Tipo" sortKey="type" />
              <SortableHeader title="Val/Cota" sortKey="valuePerShare" align="right" />
              <SortableHeader title="Qtd" sortKey="quantity" align="right" />
              <SortableHeader title="Total" sortKey="total" align="right" />
              <th className="pb-3 px-3 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedEarnings.map((e) => (
              <tr 
                key={e.id} 
                onClick={() => handleEdit(e)}
                className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors group cursor-pointer"
              >
                <td className="py-3 px-3">{formatDate(e.date)}</td>
                <td className="py-3 px-3 font-bold">{e.ticker}</td>
                <td className="py-3 px-3 text-sm">{e.type}</td>
                <td className="py-3 px-3 text-right text-sm">{hidden ? '****' : formatCurrency(e.valuePerShare)}</td>
                <td className="py-3 px-3 text-right">{e.quantity}</td>
                <td className="py-3 px-3 text-right font-medium text-green-500">{hidden ? '****' : formatCurrency(e.total)}</td>
                <td className="py-3 px-3">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={(e_stop) => { e_stop.stopPropagation(); handleEdit(e); }}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e_stop) => { e_stop.stopPropagation(); if(window.confirm('Excluir este provento?')) deleteEarning(e.id); }}
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
        {sortedEarnings.map((e) => (
          <div 
            key={e.id} 
            className="card p-4 active:scale-[0.98] transition-transform"
            onClick={() => handleEdit(e)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">
                  $
                </div>
                <div>
                  <h3 className="font-bold text-base">{e.ticker}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">{formatDate(e.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-base text-green-500">{hidden ? '****' : formatCurrency(e.total)}</p>
                <p className="text-[10px] text-gray-400 font-medium">{e.type}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800/50 text-[11px]">
               <div className="text-gray-500">
                  <span className="font-bold">{e.quantity}</span> cotas @ <span className="font-bold">{hidden ? '****' : formatCurrency(e.valuePerShare)}</span>
               </div>
               <div className="flex gap-4">
                  <button onClick={(e_stop) => { e_stop.stopPropagation(); handleEdit(e); }} className="text-gray-400 hover:text-light-accent dark:hover:text-dark-accent p-1"><Edit2 size={16} /></button>
                  <button onClick={(e_stop) => { e_stop.stopPropagation(); if(window.confirm('Excluir?')) deleteEarning(e.id); }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {sortedEarnings.length === 0 && (
        <div className="py-12 text-center text-gray-500">Nenhum provento recebido ainda..</div>
      )}
    </div>
  );
};

export default Earnings;
