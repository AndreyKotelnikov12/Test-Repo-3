import React from 'react';
import { Item } from '../types';

interface CombatEndScreenProps {
  result: 'win' | 'lose';
  xpAwarded: number;
  rewardItem?: Item;
  onClose: () => void;
}

const CombatEndScreen: React.FC<CombatEndScreenProps> = ({ result, xpAwarded, rewardItem, onClose }) => {
  const isWin = result === 'win';
  const title = isWin ? 'Победа!' : 'Поражение...';
  const titleColor = isWin ? 'text-green-400' : 'text-amber-400';
  const borderColor = isWin ? 'border-green-500/50' : 'border-amber-500/50';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-4">
      <div 
        className={`bg-[#0A100A] border-2 ${borderColor} rounded-lg shadow-xl p-6 w-full max-w-sm text-center space-y-4`}
      >
        <h1 className={`text-5xl font-bold tracking-widest ${titleColor}`}>{title}</h1>
        
        {isWin && (
          <div className="space-y-4">
            <div className="text-lg text-green-300">
              <p>Ваш отряд получает</p>
              <p className="text-3xl font-bold text-yellow-400 my-2">{xpAwarded}</p>
              <p>очков опыта.</p>
            </div>

            {rewardItem && (
                <div className="border-t border-green-800/70 pt-4">
                    <p className="text-lg text-green-300 mb-2">Получен предмет:</p>
                    <div className="flex items-center justify-center gap-4 bg-black/30 p-3 rounded-md border border-green-700/60">
                        <span className="text-4xl">{rewardItem.icon}</span>
                        <span className="text-xl font-semibold text-green-300">{rewardItem.name}</span>
                    </div>
                </div>
            )}
          </div>
        )}

        {!isWin && (
            <p className="text-lg text-gray-400">Ваш отряд был разбит и отступил.</p>
        )}

        <div className="pt-4">
            <button 
                onClick={onClose} 
                className="w-full max-w-xs mx-auto px-6 py-3 bg-[#1a2b1a] hover:bg-green-800 border-2 border-green-500/70 text-green-300 rounded-md text-xl font-semibold transition-colors"
            >
                Продолжить
            </button>
        </div>
      </div>
    </div>
  );
};

export default CombatEndScreen;