import React, { useState, useRef, useEffect } from 'react';
import { Item, ItemType, Character } from '../types';
import InventoryGrid from '../components/InventoryGrid';
import EquipmentSlots from '../components/EquipmentSlots';
import StackMenu from '../components/StackMenu';
import FilterButtons from '../components/FilterButtons';
import DropConfirmation from '../components/DropConfirmation';

interface InventoryScreenProps {
    inventory: Item[];
    setInventory: React.Dispatch<React.SetStateAction<Item[]>>;
    characters: Character[];
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
    activeCharacterIndex: number;
    setActiveCharacterIndex: React.Dispatch<React.SetStateAction<number>>;
    onNavigateToMap: () => void;
    onDropItemToMap: (item: Item) => void;
    characterCount: number;
    silver: number;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({
    inventory,
    setInventory,
    characters,
    setCharacters,
    activeCharacterIndex,
    setActiveCharacterIndex,
    onNavigateToMap,
    onDropItemToMap,
    characterCount,
    silver,
}) => {
  const [splittingItemStack, setSplittingItemStack] = useState<Item | null>(null);
  const [selectedItemStackId, setSelectedItemStackId] = useState<string | null>(null);
  const [itemToDrop, setItemToDrop] = useState<Item | null>(null);
  const [activeFilters, setActiveFilters] = useState<ItemType[]>([
    ItemType.WEAPON,
    ItemType.ARMOR,
    ItemType.MISCELLANEOUS,
    ItemType.RESOURCE,
    ItemType.QUEST,
  ]);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedItemStackId) {
        const selectedItem = inventory.find(i => i.stackId === selectedItemStackId);
        if (selectedItem && !activeFilters.includes(selectedItem.type)) {
            setSelectedItemStackId(null);
        }
    }
  }, [activeFilters, inventory, selectedItemStackId]);

  const handleEquipItem = (itemToEquip: Item) => {
    if (itemToEquip.type !== ItemType.WEAPON && itemToEquip.type !== ItemType.ARMOR) {
      return; 
    }
    
    const currentCharacter = characters[activeCharacterIndex];
    let previouslyEquippedItem: Item | null = null;
    
    if (itemToEquip.type === ItemType.WEAPON) {
      previouslyEquippedItem = currentCharacter.weapon;
    } else { // ARMOR
      previouslyEquippedItem = currentCharacter.armor;
    }

    const newInventory = inventory.filter(item => item.stackId !== itemToEquip.stackId);
    if (previouslyEquippedItem) {
      newInventory.push(previouslyEquippedItem);
    }
    setInventory(newInventory);

    const newCharacters = [...characters];
    newCharacters[activeCharacterIndex] = {
      ...newCharacters[activeCharacterIndex],
      [itemToEquip.type === ItemType.WEAPON ? 'weapon' : 'armor']: itemToEquip,
    };
    setCharacters(newCharacters);
    setSelectedItemStackId(null);
  };

  const handleUnequipWeapon = () => {
    const currentWeapon = characters[activeCharacterIndex].weapon;
    if (!currentWeapon) return;
    
    setInventory(prev => [...prev, currentWeapon]);
    
    const newCharacters = [...characters];
    newCharacters[activeCharacterIndex] = { ...newCharacters[activeCharacterIndex], weapon: null };
    setCharacters(newCharacters);
    setSelectedItemStackId(null);
  };
  
  const handleUnequipArmor = () => {
    const currentArmor = characters[activeCharacterIndex].armor;
    if (!currentArmor) return;
    
    setInventory(prev => [...prev, currentArmor]);

    const newCharacters = [...characters];
    newCharacters[activeCharacterIndex] = { ...newCharacters[activeCharacterIndex], armor: null };
    setCharacters(newCharacters);
    setSelectedItemStackId(null);
  };

  const handleUseItem = (itemToUse: Item) => {
    if (!itemToUse.use || !itemToUse.use.startsWith('HEAL_SQUAD_')) return;

    const healAmountStr = itemToUse.use.replace('HEAL_SQUAD_', '');
    const healAmount = parseInt(healAmountStr, 10);
  
    if (!isNaN(healAmount) && healAmount > 0) {
      setCharacters(prevChars =>
        prevChars.map(char => ({
          ...char,
          currentHealth: Math.min(char.maxHealth, char.currentHealth + healAmount),
        }))
      );
  
      setInventory(prevInv => {
        if (itemToUse.quantity > 1) {
          return prevInv.map(i =>
            i.stackId === itemToUse.stackId ? { ...i, quantity: i.quantity - 1 } : i
          );
        } else {
          return prevInv.filter(i => i.stackId !== itemToUse.stackId);
        }
      });
  
      if (selectedItemStackId === itemToUse.stackId) {
        setSelectedItemStackId(null);
      }
    }
  };

  const handleItemSingleClick = (item: Item) => {
    if (selectedItemStackId === item.stackId) {
      setSelectedItemStackId(null);
    } else {
      setSelectedItemStackId(item.stackId);
    }
  };

  const handleItemDoubleClick = (clickedItem: Item) => {
    if (selectedItemStackId && selectedItemStackId !== clickedItem.stackId) {
        const selectedItem = inventory.find(i => i.stackId === selectedItemStackId);
        
        if (selectedItem) {
            const areSameKind = selectedItem.id === clickedItem.id;
            const areStackable = selectedItem.type === ItemType.RESOURCE || selectedItem.type === ItemType.MISCELLANEOUS;
            
            if (areSameKind && areStackable) {
                const updatedInventory = inventory
                    .map(item => 
                        item.stackId === clickedItem.stackId 
                            ? { ...item, quantity: item.quantity + selectedItem.quantity } 
                            : item
                    )
                    .filter(item => item.stackId !== selectedItem.stackId);

                setInventory(updatedInventory);
                setSelectedItemStackId(null);
                return;
            }
        }
    }
    
    if (clickedItem.use && clickedItem.type === ItemType.MISCELLANEOUS) {
        handleUseItem(clickedItem);
        return;
    }

    if (clickedItem.type === ItemType.WEAPON || clickedItem.type === ItemType.ARMOR) {
        handleEquipItem(clickedItem);
    }
  };

  const handleInventoryItemClick = (clickedItem: Item) => {
    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        handleItemDoubleClick(clickedItem);
    } else {
        clickTimeoutRef.current = window.setTimeout(() => {
            handleItemSingleClick(clickedItem);
            clickTimeoutRef.current = null;
        }, 200);
    }
  };

  const handleOpenStackMenu = () => {
    if (!selectedItemStackId) return;
    const selectedItem = inventory.find(i => i.stackId === selectedItemStackId);
    if (selectedItem && (selectedItem.type === ItemType.RESOURCE || selectedItem.type === ItemType.MISCELLANEOUS) && selectedItem.quantity > 1) {
      setSplittingItemStack(selectedItem);
    }
  };

  const handleSplitStackConfirm = (amount: number) => {
    if (!splittingItemStack || amount <= 0) return;

    const originalStack = inventory.find(i => i.stackId === splittingItemStack.stackId);
    if (!originalStack || amount >= originalStack.quantity) {
        setSplittingItemStack(null);
        return;
    }

    const newStack: Item = {
        ...originalStack,
        quantity: amount,
        stackId: crypto.randomUUID(),
    };

    const updatedInventory = inventory.map(item => 
        item.stackId === originalStack.stackId 
            ? { ...item, quantity: item.quantity - amount }
            : item
    );

    setInventory([...updatedInventory, newStack]);
    setSplittingItemStack(null);
  };

  const handleOpenDropConfirmation = () => {
    if (!selectedItemStackId) return;
    const selectedItem = inventory.find(i => i.stackId === selectedItemStackId);
    if (selectedItem) {
        setItemToDrop(selectedItem);
    }
  };

  const handleConfirmDrop = () => {
    if (!itemToDrop) return;
    onDropItemToMap(itemToDrop);
    setInventory(prev => prev.filter(i => i.stackId !== itemToDrop.stackId));
    setItemToDrop(null);
    setSelectedItemStackId(null); 
  };

  const handleCancelDrop = () => {
    setItemToDrop(null);
  };

  const handlePrevCharacter = () => {
    setActiveCharacterIndex(prev => (prev - 1 + characterCount) % characterCount);
    setSelectedItemStackId(null);
  };
  
  const handleNextCharacter = () => {
    setActiveCharacterIndex(prev => (prev + 1) % characterCount);
    setSelectedItemStackId(null);
  };

  const handleFilterToggle = (filterType: ItemType) => {
    setActiveFilters(prevFilters => {
        const isAlreadyActive = prevFilters.includes(filterType);
        if (isAlreadyActive) {
            if (prevFilters.length === 1) {
                return prevFilters;
            }
            return prevFilters.filter(f => f !== filterType);
        } else {
            return [...prevFilters, filterType];
        }
    });
  };

  const activeCharacter = characters[activeCharacterIndex];
  
  const selectedItem = inventory.find(i => i.stackId === selectedItemStackId);
  const isStackButtonEnabled = !!(selectedItem && (selectedItem.type === ItemType.RESOURCE || selectedItem.type === ItemType.MISCELLANEOUS) && selectedItem.quantity > 1);
  const isDropButtonEnabled = !!selectedItem;
  const isUseButtonEnabled = !!(selectedItem && selectedItem.use);
  const filteredInventory = inventory.filter(item => activeFilters.includes(item.type));

  return (
    <>
      <div className="min-h-screen bg-[#0a1a0a] flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md mx-auto bg-[#0A100A] rounded-lg shadow-lg p-4 md:p-6 space-y-6 border-2 border-green-500/50 relative">
          
          <button onClick={onNavigateToMap} className="absolute top-2 right-2 text-3xl leading-none text-green-400/70 hover:text-white transition-colors p-2 z-10">
            &times;
          </button>
          
          <h1 className="text-2xl font-bold text-center text-green-400 tracking-wider">Инвентарь</h1>
          
          <div className="text-center text-lg text-yellow-400 font-semibold" style={{ textShadow: '1px 1px 2px black' }}>
            Серебро: {silver}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={handlePrevCharacter} className="px-4 py-2 bg-[#1a2b1a] hover:bg-green-800 border border-green-500/70 text-green-400 rounded-md transition-colors">&lt;</button>
            <div className="text-xl font-semibold text-center text-green-300 w-40">Персонаж {activeCharacterIndex + 1}</div>
            <button onClick={handleNextCharacter} className="px-4 py-2 bg-[#1a2b1a] hover:bg-green-800 border border-green-500/70 text-green-400 rounded-md transition-colors">&gt;</button>
          </div>

          <EquipmentSlots 
            weapon={activeCharacter.weapon}
            armor={activeCharacter.armor}
            onUnequipWeapon={handleUnequipWeapon}
            onUnequipArmor={handleUnequipArmor}
            selectedItemStackId={selectedItemStackId}
            onItemSingleClick={handleItemSingleClick}
          />

          <div className="border-t border-green-800/70 my-4"></div>

          <FilterButtons 
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
          />

          <InventoryGrid 
            items={filteredInventory}
            onItemClick={handleInventoryItemClick}
            selectedItemStackId={selectedItemStackId}
            onOpenStackMenu={handleOpenStackMenu}
            isStackButtonEnabled={isStackButtonEnabled}
            onDropItem={handleOpenDropConfirmation}
            isDropButtonEnabled={isDropButtonEnabled}
            onUseItem={() => selectedItem && handleUseItem(selectedItem)}
            isUseButtonEnabled={isUseButtonEnabled}
          />
        </div>
      </div>
      {splittingItemStack && (
        <StackMenu
            item={splittingItemStack}
            onConfirm={handleSplitStackConfirm}
            onCancel={() => setSplittingItemStack(null)}
        />
       )}
       {itemToDrop && (
        <DropConfirmation 
            item={itemToDrop}
            onConfirm={handleConfirmDrop}
            onCancel={handleCancelDrop}
        />
       )}
    </>
  );
}

export default InventoryScreen;