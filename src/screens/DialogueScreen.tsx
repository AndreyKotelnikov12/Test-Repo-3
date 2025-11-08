import React, { useMemo, useState } from 'react';
import { Item, Quest } from '../types';
import { CITIES, QUEST_ITEM_POOL_IDS, BATTLE_REWARDS_POOL } from '../constants';

interface DialogueScreenProps {
    merchantName: string;
    cityId: string;
    cityName: string;
    onTrade: () => void;
    onExit: () => void;
    quests: Quest[];
    playerInventory: Item[];
    onAcceptQuest: (quest: Quest) => void;
    onCompleteQuest: (questId: string) => void;
}

const DialogueScreen: React.FC<DialogueScreenProps> = ({
    merchantName,
    cityId,
    cityName,
    onTrade,
    onExit,
    quests,
    playerInventory,
    onAcceptQuest,
    onCompleteQuest,
}) => {
    const [dialogueState, setDialogueState] = useState<'greeting' | 'quest_offer'>('greeting');
    const [offeredQuest, setOfferedQuest] = useState<Quest | null>(null);

    const activeQuest = useMemo(() => 
        quests.find(q => q.giverCityId === cityId && q.giverName === merchantName && q.status === 'active'),
    [quests, cityId, merchantName]);

    const canCompleteQuest = useMemo(() => {
        if (!activeQuest) return false;
        const totalItems = playerInventory
            .filter(item => item.id === activeQuest.itemId)
            .reduce((sum, item) => sum + item.quantity, 0);
        return totalItems >= activeQuest.requiredQuantity;
    }, [activeQuest, playerInventory]);

    const handleAskForQuest = () => {
        if (activeQuest) return;

        const possibleItemIds = QUEST_ITEM_POOL_IDS;
        const randomItemId = possibleItemIds[Math.floor(Math.random() * possibleItemIds.length)];
        const itemTemplate = BATTLE_REWARDS_POOL.find(item => item.id === randomItemId);

        if (!itemTemplate || !itemTemplate.price) return;

        const requiredQuantity = Math.floor(Math.random() * 5) + 1;
        const rewardSilver = (itemTemplate.price * requiredQuantity) * 2;

        const newQuest: Quest = {
            id: crypto.randomUUID(),
            giverCityId: cityId,
            giverName: merchantName,
            cityName: cityName,
            itemId: itemTemplate.id,
            itemName: itemTemplate.name,
            itemIcon: itemTemplate.icon,
            requiredQuantity: requiredQuantity,
            rewardSilver: rewardSilver,
            description: `Принеси мне ${requiredQuantity}x ${itemTemplate.name} (${itemTemplate.icon}). Я хорошо заплачу.`,
            status: 'active',
        };

        setOfferedQuest(newQuest);
        setDialogueState('quest_offer');
    };

    const handleAcceptQuest = () => {
        if (offeredQuest) {
            onAcceptQuest(offeredQuest);
            setOfferedQuest(null);
            setDialogueState('greeting');
        }
    };

    const handleDeclineQuest = () => {
        setOfferedQuest(null);
        setDialogueState('greeting');
    };

    const getTraderText = () => {
        if (activeQuest) {
            return `Ты еще не принес мне то, что я просил. Мне нужно ${activeQuest.requiredQuantity}x ${activeQuest.itemName}.`;
        }
        if (dialogueState === 'quest_offer' && offeredQuest) {
            return `Да, задание есть. ${offeredQuest.description}`;
        }
        return "Эй, привет, как дела?";
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-4">
            <div className="w-full max-w-lg mx-auto bg-[#0A100A] rounded-lg shadow-lg p-6 border-2 border-green-500/50 space-y-6">
                <header className="flex items-center gap-4 border-b border-green-800/70 pb-4">
                    <div className="w-20 h-20 flex items-center justify-center bg-black/30 rounded-full border-2 border-green-700/60 flex-shrink-0">
                        <span className="text-5xl" role="img" aria-label="Торговец">👨‍🌾</span>
                    </div>
                    <h1 className="text-2xl font-bold text-green-400 tracking-wider">{merchantName}</h1>
                </header>
                
                <main className="min-h-[6rem] flex items-center justify-center p-4 bg-black/20 rounded-md">
                    <p className="text-lg text-green-300 italic text-center">"{getTraderText()}"</p>
                </main>

                <footer className="flex flex-col items-stretch gap-3">
                    {dialogueState === 'greeting' && !activeQuest && (
                        <button 
                            onClick={handleAskForQuest}
                            className="w-full text-left p-3 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-base font-semibold transition-colors hover:bg-green-800/80 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                            &gt; "Привет, у тебя есть задание?"
                        </button>
                    )}
                    {dialogueState === 'quest_offer' && offeredQuest && (
                        <>
                            <button 
                                onClick={handleAcceptQuest}
                                className="w-full text-left p-3 bg-green-800/80 border border-green-500/70 text-green-300 rounded-md text-base font-semibold transition-colors hover:bg-green-700/80 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                &gt; "Я берусь за это."
                            </button>
                            <button 
                                onClick={handleDeclineQuest}
                                className="w-full text-left p-3 bg-gray-800/80 border border-gray-600/70 text-gray-300 rounded-md text-base font-semibold transition-colors hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                &gt; "Я пока откажусь."
                            </button>
                        </>
                    )}
                    {activeQuest && canCompleteQuest && (
                         <button 
                            onClick={() => onCompleteQuest(activeQuest.id)}
                            className="w-full text-left p-3 bg-yellow-800/80 border border-yellow-500/70 text-yellow-300 rounded-md text-base font-semibold transition-colors hover:bg-yellow-700/80 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            &gt; "Я принес то, что ты просил." ({activeQuest.itemName} x{activeQuest.requiredQuantity})
                        </button>
                    )}
                    <button 
                        onClick={onTrade}
                        className="w-full text-left p-3 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-base font-semibold transition-colors hover:bg-green-800/80 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        &gt; "Давай поторгуем."
                    </button>
                    <button 
                        onClick={onExit}
                        className="w-full text-left p-3 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-base font-semibold transition-colors hover:bg-green-800/80 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        &gt; "Я передумал. До свидания."
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DialogueScreen;