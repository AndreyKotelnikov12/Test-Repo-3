import React from 'react';
import { Item } from '../types';

interface TooltipProps {
  item: Item;
}

const Tooltip: React.FC<TooltipProps> = ({ item }) => {
  const getStatColor = () => {
    if (item.damage) return 'text-amber-400';
    if (item.armor) return 'text-sky-400';
    if (item.effect?.toLowerCase().includes('лечит') || item.effect?.toLowerCase().includes('heals')) return 'text-green-400';
    return 'text-yellow-300';
  }

  return (
    <div className="relative w-max max-w-xs p-3 bg-[#0A100A] border border-green-500/50 rounded-lg shadow-2xl z-50 pointer-events-none transition-opacity duration-200 animate-fade-in font-mono">
      <h3 className="text-lg font-bold text-green-300 mb-1">{item.name}</h3>
      <p className="text-sm text-green-500/80 italic mb-2">"{item.description}"</p>
      
      {(item.damage || item.armor || item.effect || item.price) && <div className="border-t border-green-800/70 pt-2 mt-2 space-y-1">
        {item.damage && <p className={`text-sm font-semibold ${getStatColor()}`}>Урон: {item.damage}</p>}
        {item.armor && <p className={`text-sm font-semibold ${getStatColor()}`}>Броня: {item.armor}</p>}
        {item.effect && <p className={`text-sm font-semibold ${getStatColor()}`}>Эффект: {item.effect}</p>}
        {item.price && <p className="text-sm font-semibold text-yellow-300">Цена: {item.price}</p>}
      </div>}
      
    </div>
  );
};

export default Tooltip;