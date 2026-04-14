import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

const DateInput = ({ value, onChange, label, required = false }) => {
  const [displayValue, setDisplayValue] = useState('');
  const dateInputRef = useRef(null);

  // Sync internal state with prop value (YYYY-MM-DD -> DD/MM/AAAA)
  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m, d] = value.split('-');
      setDisplayValue(`${d}/${m}/${y}`);
    } else if (!value) {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    let input = e.target.value.replace(/\D/g, ''); // only digits
    if (input.length > 8) input = input.slice(0, 8);

    // Apply mask DD/MM/AAAA
    let masked = input;
    if (input.length > 4) {
      masked = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
    } else if (input.length > 2) {
      masked = `${input.slice(0, 2)}/${input.slice(2)}`;
    }

    setDisplayValue(masked);

    // If full date, send back to parent in YYYY-MM-DD format
    if (input.length === 8) {
      const d = input.slice(0, 2);
      const m = input.slice(2, 4);
      const y = input.slice(4);
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange(''); // incomplete date
    }
  };

  const handleCalendarChange = (e) => {
    const newVal = e.target.value; // YYYY-MM-DD
    onChange(newVal);
  };

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <div className="relative group">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          required={required}
          className="input-field pl-10 border-gray-200 dark:border-gray-700 focus:border-light-accent dark:focus:border-dark-accent transition-all animate-transition"
          value={displayValue}
          onChange={handleChange}
        />
        
        {/* Calendar Trigger Container */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none group-focus-within:text-light-accent dark:group-focus-within:text-dark-accent transition-colors">
          <Calendar size={18} />
        </div>

        {/* Hidden Native Date Input covering the icon area */}
        <input 
          type="date"
          ref={dateInputRef}
          value={value || ''}
          onChange={handleCalendarChange}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
};

export default DateInput;
