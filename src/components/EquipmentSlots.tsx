import React from 'react';
import { Item } from '../types';
import InventorySlot from './InventorySlot';

interface EquipmentSlotsProps {
  weapon: Item | null;
  armor: Item | null;
  onUnequipWeapon: () => void;
  onUnequipArmor: () => void;
  selectedItemStackId: string | null;
  onItemSingleClick: (item: Item) => void;
}

const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({ weapon, armor, onUnequipWeapon, onUnequipArmor, selectedItemStackId, onItemSingleClick }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-green-400/80 mb-3 text-center">Экипировка персонажа</h2>
      <div className="flex justify-center items-center gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24">
          <InventorySlot
            item={weapon}
            onDoubleClick={onUnequipWeapon}
            onClick={() => weapon && onItemSingleClick(weapon)}
            isSelected={!!weapon && weapon.stackId === selectedItemStackId}
            placeholderText="Оружие"
            className="border-green-500/50"
          />
        </div>
        <div className="w-20 h-20 md:w-24 md:h-24">
          <InventorySlot
            item={armor}
            onDoubleClick={onUnequipArmor}
            onClick={() => armor && onItemSingleClick(armor)}
            isSelected={!!armor && armor.stackId === selectedItemStackId}
            placeholderText="Броня"
            className="border-green-500/50"
          />
        </div>
      </div>
    </div>
  );
};

export default EquipmentSlots;