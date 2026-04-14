import React from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick, title = "Adicionar" }) => {
  return (
    <button 
      onClick={onClick}
      className="fab group"
      aria-label={title}
      title={title}
    >
      <Plus size={32} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
};

export default FloatingActionButton;
