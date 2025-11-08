import React, { useEffect } from 'react';
import { Quest } from '../types';

interface QuestLogScreenProps {
  quests: Quest[];
  onClose: () => void;
}

const QuestLogScreen: React.FC<QuestLogScreenProps> = ({ quests, onClose }) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeQuests = quests.filter(q => q.status === 'active');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-4" onMouseDown={onClose}>
      <div 
        className="bg-[#0A100A] border-2 border-green-500/50 rounded-lg shadow-xl p-6 w-full max-w-md space-y-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-green-800/70 pb-3">
            <h2 className="text-2xl font-bold text-green-300">Журнал заданий</h2>
            <button onClick={onClose} className="text-3xl leading-none text-green-400/70 hover:text-white">&times;</button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-black/50">
          {activeQuests.length > 0 ? (
            activeQuests.map(quest => {
              const isMainQuest = quest.id === 'main_quest_find_chip';
              const title = isMainQuest ? 'Найти Водный чип' : `Принести: ${quest.itemName}`;

              return (
                <div key={quest.id} className={`bg-black/30 p-4 rounded-md border ${isMainQuest ? 'border-yellow-500/60' : 'border-green-700/60'}`}>
                  <p className={`text-lg font-semibold ${isMainQuest ? 'text-yellow-300' : 'text-green-300'}`}>
                    {isMainQuest ? '👑 ' : quest.itemIcon + ' '} {title}
                  </p>
                  <p className="text-sm text-green-400/80 italic mt-1 mb-2">"{quest.description}"</p>
                  <div className="border-t border-green-800/50 pt-2 text-sm text-green-500/90 space-y-1">
                    <p>Задание от: <span className="font-semibold text-yellow-400">{quest.giverName}</span> ({quest.cityName})</p>
                    {!isMainQuest && <p>Цель: <span className="font-semibold text-green-300">{quest.itemName} (x{quest.requiredQuantity})</span></p>}
                    <p>Награда: <span className="font-semibold text-yellow-300">{quest.rewardSilver} серебра</span></p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-green-600/80 italic py-8">У вас нет активных заданий.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestLogScreen;