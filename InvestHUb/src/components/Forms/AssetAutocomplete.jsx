import React, { useState, useEffect, useRef } from 'react';
import { searchAssets } from '../../hooks/usePriceApi';

const AssetAutocomplete = ({ value, onChange, onSelect }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      const results = await searchAssets(query);
      setSuggestions(results);
      setLoading(false);
      setIsOpen(true);
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (asset) => {
    setQuery(asset.stock);
    setIsOpen(false);
    onSelect(asset.stock, asset.name);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        className="input-field uppercase"
        placeholder="PETR4, MXRF11, etc..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value.toUpperCase());
          onChange(e.target.value.toUpperCase());
        }}
        onFocus={() => {if(suggestions.length > 0) setIsOpen(true);}}
      />
      {loading && <div className="absolute right-3 top-2.5 text-xs text-gray-400">Buscando...</div>}
      
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((asset) => (
            <li
              key={asset.stock}
              className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#21262d] cursor-pointer"
              onClick={() => handleSelect(asset)}
            >
              <div className="font-semibold text-light-accent dark:text-dark-accent">{asset.stock}</div>
              <div className="text-sm text-gray-500 truncate">{asset.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssetAutocomplete;
