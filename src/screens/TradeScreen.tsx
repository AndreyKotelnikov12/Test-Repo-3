import React, { useState, useMemo } from 'react';
import { Item, ItemType } from '../types';
import InventorySlot from '../components/InventorySlot';

interface TradeScreenProps {
    merchantName: string;
    onExit: () => void;
    playerInventory: Item[];
    setPlayerInventory: React.Dispatch<React.SetStateAction<Item[]>>;
    merchantInventory: Item[];
    setMerchantInventory: React.Dispatch<React.SetStateAction<Item[]>>;
    silver: number;
    setSilver: React.Dispatch<React.SetStateAction<number>>;
}

const TradeScreen: React.FC<TradeScreenProps> = ({
    merchantName,
    onExit,
    playerInventory,
    setPlayerInventory,
    merchantInventory,
    setMerchantInventory,
    silver,
    setSilver,
}) => {
    const [view, setView] = useState<'merchant' | 'player'>('merchant');
    const [selectedItem, setSelectedItem] = useState<{ item: Item, source: 'player' | 'merchant' } | null>(null);

    const sortedPlayerInventory = useMemo(() => [...playerInventory].sort((a, b) => a.name.localeCompare(b.name)), [playerInventory]);
    const sortedMerchantInventory = useMemo(() => [...merchantInventory].sort((a, b) => a.name.localeCompare(b.name)), [merchantInventory]);

    const handleSelect = (item: Item, source: 'player' | 'merchant') => {
        if (selectedItem?.item.stackId === item.stackId) {
            setSelectedItem(null);
        } else {
            setSelectedItem({ item, source });
        }
    };
    
    const handleToggleView = () => {
        setView(prev => prev === 'merchant' ? 'player' : 'merchant');
        setSelectedItem(null); // Deselect item when switching views
    };

    const handleTrade = () => {
        if (!selectedItem) return;

        const { item, source } = selectedItem;
        const price = item.price || 0;

        if (source === 'merchant') { // Buy
            if (silver >= price) {
                setSilver(prev => prev - price);
                setMerchantInventory(prev => prev.filter(i => i.stackId !== item.stackId));
                setPlayerInventory(prev => [...prev, item]);
                setSelectedItem(null);
            } else {
                alert("Недостаточно серебра!");
            }
        } else { // Sell
            if (item.type === ItemType.QUEST) {
                alert("Нельзя продать квестовый предмет!");
                return;
            }
            setSilver(prev => prev + price);
            setPlayerInventory(prev => prev.filter(i => i.stackId !== item.stackId));
            setMerchantInventory(prev => [...prev, item]);
            setSelectedItem(null);
        }
    };

    const isActionDisabled = useMemo(() => {
        if (!selectedItem) return true;
        if (selectedItem.source === 'merchant') {
            return silver < (selectedItem.item.price || 0);
        }
        if (selectedItem.source === 'player') {
            return selectedItem.item.type === ItemType.QUEST;
        }
        return false;
    }, [selectedItem, silver]);

    const getButtonText = () => {
        if (!selectedItem) return '...';
        return selectedItem.source === 'merchant' ? 'Купить' : 'Продать';
    }

    const renderInventoryGrid = (items: Item[], source: 'player' | 'merchant') => (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 content-start gap-3">
            {items.map(item => (
                <InventorySlot
                    key={item.stackId}
                    item={item}
                    onClick={() => handleSelect(item, source)}
                    isSelected={selectedItem?.item.stackId === item.stackId}
                />
            ))}
            {items.length === 0 && <p className="col-span-full text-center text-green-600/70 italic mt-4">Инвентарь пуст</p>}
        </div>
    );
    

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-2 sm:p-4">
            <div className="w-full max-w-4xl mx-auto bg-[#0A100A] rounded-lg shadow-lg p-4 border-2 border-green-500/50 relative flex flex-col h-full max-h-[95vh]">
                <button onClick={onExit} className="absolute top-2 right-2 text-3xl leading-none text-green-400/70 hover:text-white transition-colors p-2 z-10">
                    &times;
                </button>
                <header className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-green-800/70 pb-3 pt-8 sm:pt-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-green-400 tracking-wider">Лавка: {merchantName}</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <div className="text-base sm:text-lg text-yellow-400 font-semibold order-2 sm:order-1" style={{ textShadow: '1px 1px 2px black' }}>
                            Ваше серебро: {silver}
                        </div>
                        <button
                            onClick={handleToggleView}
                            className="px-4 py-1 bg-[#1a2b1a] border border-green-500/70 text-green-400 rounded-md text-sm font-semibold transition-colors hover:enabled:bg-green-800 order-1 sm:order-2"
                        >
                            {view === 'merchant' ? "Показать мои вещи" : "Показать вещи торговца"}
                        </button>
                    </div>
                </header>

                <main className="flex-grow min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-black/50 pr-2 py-3">
                    {view === 'merchant' ? (
                        <div>
                            <h2 className="text-lg font-semibold text-green-400/70 mb-3">Товары торговца</h2>
                            {renderInventoryGrid(sortedMerchantInventory, 'merchant')}
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-lg font-semibold text-green-400/70 mb-3">Ваш инвентарь</h2>
                            {renderInventoryGrid(sortedPlayerInventory, 'player')}
                        </div>
                    )}
                </main>
                
                <footer className="flex-shrink-0 border-t border-green-800/70 pt-3 flex items-center justify-center min-h-[6rem]">
                    {selectedItem ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
                           <div className="w-16 h-16 flex-shrink-0">
                             <InventorySlot item={selectedItem.item} />
                           </div>
                           <div className="flex-grow text-center sm:text-left text-green-300">
                             <p className="font-bold text-base sm:text-lg">{selectedItem.item.name}</p>
                             <p className="text-sm text-yellow-400">Цена: {selectedItem.item.price || '---'}</p>
                           </div>
                           <button 
                                onClick={handleTrade}
                                disabled={isActionDisabled}
                                className="px-6 py-2 sm:px-8 sm:py-3 bg-[#1a2b1a] border border-green-500/70 text-green-400 rounded-md text-base sm:text-lg font-semibold transition-colors disabled:bg-gray-800/50 disabled:text-gray-500 disabled:border-gray-600 disabled:cursor-not-allowed hover:enabled:bg-green-800"
                            >
                                {getButtonText()}
                            </button>
                        </div>
                    ) : (
                        <p className="text-green-500/80 italic">Выберите предмет для сделки...</p>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default TradeScreen;