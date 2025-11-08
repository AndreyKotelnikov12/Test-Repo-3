import React from 'react';
import { ItemType } from '../types';

interface FilterButtonsProps {
    activeFilters: ItemType[];
    onFilterToggle: (filterType: ItemType) => void;
}

const filterConfig = [
    { type: ItemType.WEAPON, label: 'Оружие' },
    { type: ItemType.ARMOR, label: 'Броня' },
    { type: ItemType.MISCELLANEOUS, label: 'Разное' },
    { type: ItemType.RESOURCE, label: 'Ресурсы' },
    { type: ItemType.QUEST, label: 'Квесты' },
];

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilters, onFilterToggle }) => {
    const getButtonClass = (type: ItemType) => {
        const isActive = activeFilters.includes(type);
        const baseClass = "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 border-2";
        
        if (isActive) {
            return `${baseClass} bg-green-800/80 border-green-500 text-green-300 shadow-md`;
        } else {
            return `${baseClass} bg-black/30 border-green-800/70 text-green-600 hover:bg-green-900/40 hover:border-green-700`;
        }
    };
    
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
            {filterConfig.map(({ type, label }) => (
                <button
                    key={type}
                    onClick={() => onFilterToggle(type)}
                    className={getButtonClass(type)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default FilterButtons;