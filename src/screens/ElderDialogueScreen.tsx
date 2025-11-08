import React, { useMemo } from 'react';
import { Item, MainQuestState } from '../types';

interface ElderDialogueScreenProps {
    onExit: () => void;
    inventory: Item[];
    mainQuestState: MainQuestState;
    onCompleteMainQuest: () => void;
}

const ElderDialogueScreen: React.FC<ElderDialogueScreenProps> = ({
    onExit,
    inventory,
    mainQuestState,
    onCompleteMainQuest,
}) => {
    const waterChip = useMemo(() => inventory.find(item => item.id === 301), [inventory]);

    const handleCompleteQuest = () => {
        if (!waterChip) return;
        onCompleteMainQuest();
        onExit();
    };

    const getElderText = () => {
        if (mainQuestState === 'completed') {
            return "Спасибо тебе еще раз, герой. Оазис в безопасности благодаря тебе.";
        }
        if (waterChip) {
            return "Невероятно! Ты нашел Водный чип! Ты спас нас всех. Пожалуйста, прими эту награду в знак нашей вечной благодарности.";
        }
        return "Судьба Оазиса в твоих руках. Пожалуйста, поспеши и найди Водный чип.";
    };
    
    const getPlayerOptions = () => {
        if (mainQuestState === 'completed') {
             return <button onClick={onExit} className="w-full text-left p-3 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-base font-semibold transition-colors hover:bg-green-800/80">&gt; "Всегда рад помочь."</button>;
        }
        if (waterChip) {
            return <button onClick={handleCompleteQuest} className="w-full text-left p-3 bg-yellow-800/80 border border-yellow-500/70 text-yellow-300 rounded-md text-base font-semibold transition-colors hover:bg-yellow-700/80">&gt; "Вот ваш Водный чип."</button>;
        }
        return <button onClick={onExit} className="w-full text-left p-3 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-base font-semibold transition-colors hover:bg-green-800/80">&gt; "Я все еще в поисках."</button>;
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-4">
            <div className="w-full max-w-lg mx-auto bg-[#0A100A] rounded-lg shadow-lg p-6 border-2 border-sky-500/50 space-y-6">
                <header className="flex items-center gap-4 border-b border-sky-800/70 pb-4">
                    <div className="w-20 h-20 flex items-center justify-center bg-black/30 rounded-full border-2 border-sky-700/60 flex-shrink-0">
                        <span className="text-5xl" role="img" aria-label="Старейшина">👳‍♂️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-sky-400 tracking-wider">Старейшина Оазиса</h1>
                </header>
                
                <main className="min-h-[6rem] flex items-center justify-center p-4 bg-black/20 rounded-md">
                    <p className="text-lg text-sky-300 italic text-center">"{getElderText()}"</p>
                </main>

                <footer className="flex flex-col items-stretch gap-3">
                   {getPlayerOptions()}
                </footer>
            </div>
        </div>
    );
};

export default ElderDialogueScreen;