import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Item, ItemType } from '../types';
import Tooltip from './Tooltip';

interface InventorySlotProps {
  item: Item | null;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  placeholderText?: string;
  className?: string;
}

const getItemDefaultBgClass = (item: Item | null): string => {
    return 'bg-green-900/20'; // Unified style for all items
};

const getSelectionBgClass = (item: Item | null): string => {
    return 'bg-green-500/40';
};

const InventorySlot: React.FC<InventorySlotProps> = ({ item, onClick, onDoubleClick, isSelected, placeholderText, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  const renderTooltip = () => {
    if (!isHovered || !item) return null;
    
    return ReactDOM.createPortal(
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 pointer-events-none">
          <Tooltip item={item} />
      </div>,
      document.body
    );
  };

  const baseStyle = "relative aspect-square w-full h-full flex items-center justify-center rounded-md transition-all duration-200";
  const emptyStyle = "bg-black/30 border-2 border-dashed border-green-800/40";
  const filledStyle = "border border-green-700/60 hover:bg-green-500/20 hover:border-green-400 cursor-pointer shadow-lg";

  const defaultBgClass = item ? getItemDefaultBgClass(item) : '';
  const selectionClass = isSelected ? getSelectionBgClass(item) : '';

  return (
    <div
      ref={slotRef}
      className={`${baseStyle} ${item ? filledStyle : emptyStyle} ${selectionClass || defaultBgClass} ${className}`}
      onClick={item ? onClick : undefined}
      onDoubleClick={item ? onDoubleClick : undefined}
      onMouseEnter={() => item && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={item ? item.name : placeholderText || 'Пустой слот'}
    >
      {item ? (
        <>
          <span className="text-3xl" role="img" aria-label={item.name}>
            {item.icon}
          </span>
           {item.quantity > 1 && (
            <span className="absolute bottom-0 right-1 text-sm font-bold text-yellow-400" style={{ textShadow: '1px 1px 2px black' }}>
              {item.quantity}
            </span>
          )}
          {renderTooltip()}
        </>
      ) : (
        placeholderText && <span className="text-xs text-gray-500">{placeholderText}</span>
      )}
    </div>
  );
};

export default InventorySlot;