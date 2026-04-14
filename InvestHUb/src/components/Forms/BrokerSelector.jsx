import React, { useState, useRef, useEffect } from 'react';
import { Star, ChevronDown, Check } from 'lucide-react';
import { usePortfolioContext } from '../../context/PortfolioContext';

const BrokerSelector = ({ value, onChange }) => {
    const { settings, updateSettings } = usePortfolioContext();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const brokers = [
        'XP', 'Clear', 'Rico', 'BTG', 
        'Nu Invest', 'Inter', 'Toro', 
        'Íon Itaú', 'Ágora', 'Outro'
    ];

    const defaultBroker = settings?.defaultBroker || 'XP';

    const handleSetDefault = (e, broker) => {
        e.stopPropagation();
        updateSettings({ defaultBroker: broker });
    };

    const handleSelect = (broker) => {
        onChange(broker);
        setIsOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <label className="block text-sm font-medium mb-1">Corretora</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="input-field flex items-center justify-between group overflow-hidden"
            >
                <div className="flex items-center gap-2">
                    <span className="font-medium">{value}</span>
                    {value === defaultBroker && (
                        <Star size={12} className="fill-current text-yellow-500 animate-in zoom-in-50" />
                    )}
                </div>
                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Mobile Backdrop */}
                    <div className="fixed inset-0 bg-black/40 z-[100] lg:hidden animate-in fade-in duration-300" onClick={() => setIsOpen(false)}></div>
                    
                    {/* List Container */}
                    <div className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-[#0D1117] rounded-t-3xl p-6 lg:absolute lg:bottom-auto lg:top-full lg:left-0 lg:right-0 lg:mt-2 lg:rounded-2xl lg:shadow-2xl lg:border lg:border-gray-100 lg:dark:border-gray-800 animate-in slide-in-from-bottom-full lg:slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center mb-6 lg:hidden">
                            <h3 className="text-lg font-bold">Selecionar Corretora</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 font-medium">Fechar</button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                            {brokers.map((broker) => {
                                const isSelected = value === broker;
                                const isDefault = defaultBroker === broker;

                                return (
                                    <button
                                        key={broker}
                                        type="button"
                                        onClick={() => handleSelect(broker)}
                                        className={`flex items-center justify-between p-4 rounded-xl transition-all active:scale-[0.98] ${
                                            isSelected 
                                            ? 'bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent' 
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full transition-colors ${isSelected ? 'bg-current' : 'bg-transparent border border-gray-400'}`}></div>
                                            <span className="font-bold text-sm">{broker}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isSelected && <Check size={18} className="opacity-60" />}
                                            <button
                                                type="button"
                                                onClick={(e) => handleSetDefault(e, broker)}
                                                className={`p-2 rounded-full transition-colors ${
                                                    isDefault 
                                                    ? 'text-yellow-500 scale-110' 
                                                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-500/50'
                                                }`}
                                            >
                                                <Star size={20} className={isDefault ? 'fill-current' : ''} />
                                            </button>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BrokerSelector;
