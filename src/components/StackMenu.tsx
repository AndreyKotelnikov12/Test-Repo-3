import React, { useState, useEffect } from 'react';
import { Item } from '../types';

interface StackMenuProps {
  item: Item;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

const StackMenu: React.FC<StackMenuProps> = ({ item, onConfirm, onCancel }) => {
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleAmountChange = (newAmount: number) => {
    const maxAmount = item.quantity - 1;
    const validatedAmount = Math.max(1, Math.min(newAmount, maxAmount));
    setAmount(validatedAmount);
  };

  const handleConfirm = () => {
    onConfirm(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-4" onMouseDown={onCancel}>
      <div 
        className="bg-[#0A100A] border-2 border-green-500/50 rounded-lg shadow-xl p-6 w-full max-w-xs space-y-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-black/30 rounded-md border border-green-700/60 flex-shrink-0">
            <span className="text-4xl">{item.icon}</span>
          </div>
          <h2 className="text-xl font-bold text-green-300 truncate">{item.name}</h2>
        </div>
        <p className="text-sm text-green-400/80">Выберите количество для отделения:</p>
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => handleAmountChange(amount - 1)} className="px-4 py-2 text-xl bg-[#1a2b1a] hover:bg-green-800 border border-green-500/70 text-green-400 rounded-md transition-colors">-</button>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => handleAmountChange(parseInt(e.target.value, 10) || 1)}
            onFocus={(e) => e.target.select()}
            className="w-full text-center bg-black/50 border border-green-700/60 rounded-md p-2 text-lg font-semibold text-green-300"
          />
          <button onClick={() => handleAmountChange(amount + 1)} className="px-4 py-2 text-xl bg-[#1a2b1a] hover:bg-green-800 border border-green-500/70 text-green-400 rounded-md transition-colors">+</button>
        </div>
        <div className="flex justify-center">
            <button 
                onClick={() => handleAmountChange(Math.max(1, Math.floor(item.quantity / 2)))}
                className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 rounded-md transition-colors text-sm text-gray-300"
            >
                Половина
            </button>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onCancel} className="px-5 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 rounded-md transition-colors text-gray-300">Отмена</button>
          <button onClick={handleConfirm} className="px-5 py-2 bg-green-800 hover:bg-green-700 border border-green-500/70 text-green-300 rounded-md transition-colors font-semibold">Подтвердить</button>
        </div>
      </div>
    </div>
  );
};

export default StackMenu;