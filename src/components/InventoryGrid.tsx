import React from 'react';
import { Item } from '../types';
import InventorySlot from './InventorySlot';

interface InventoryGridProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  selectedItemStackId: string | null;
  onOpenStackMenu: () => void;
  isStackButtonEnabled: boolean;
  onDropItem: () => void;
  isDropButtonEnabled: boolean;
  onUseItem: () => void;
  isUseButtonEnabled: boolean;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ items, onItemClick, selectedItemStackId, onOpenStackMenu, isStackButtonEnabled, onDropItem, isDropButtonEnabled, onUseItem, isUseButtonEnabled }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold text-green-400/70 text-center sm:text-left">Общий инвентарь</h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onUseItem}
            disabled={!isUseButtonEnabled}
            className="px-4 py-1 bg-[#1a2b2b] border border-sky-500/70 text-sky-300 rounded-md text-sm font-semibold transition-colors disabled:bg-gray-800/50 disabled:text-gray-500 disabled:border-gray-600 disabled:cursor-not-allowed hover:enabled:bg-sky-800"
          >
            Использовать
          </button>
          <button
            onClick={onOpenStackMenu}
            disabled={!isStackButtonEnabled}
            className="px-4 py-1 bg-[#1a2b1a] border border-green-500/70 text-green-400 rounded-md text-sm font-semibold transition-colors disabled:bg-gray-800/50 disabled:text-gray-500 disabled:border-gray-600 disabled:cursor-not-allowed hover:enabled:bg-green-800"
          >
            Отделить
          </button>
          <button
            onClick={onDropItem}
            disabled={!isDropButtonEnabled}
            className="px-4 py-1 bg-[#2b1a1a] border border-amber-500/70 text-amber-300 rounded-md text-sm font-semibold transition-colors disabled:bg-gray-800/50 disabled:text-gray-500 disabled:border-gray-600 disabled:cursor-not-allowed hover:enabled:bg-amber-800"
          >
            Выбросить
          </button>
        </div>
      </div>
      <div className="h-64 overflow-y-scroll pr-2 grid grid-cols-4 content-start gap-3 scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-black/50">
        {items.map(item => (
          <InventorySlot
            key={item.stackId}
            item={item}
            onClick={() => onItemClick(item)}
            isSelected={item.stackId === selectedItemStackId}
          />
        ))}
      </div>
    </div>
  );
};

export default InventoryGrid;