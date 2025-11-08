import React, { useEffect, useState, useRef } from 'react';
import { CharacterStats } from '../types';
import { MAX_LEVEL, XP_PER_LEVEL } from '../constants';

interface CharacteristicsModalProps {
  stats: CharacterStats;
  level: number;
  xp: number;
  characterIndex: number;
  onClose: () => void;
  onPrevCharacter: () => void;
  onNextCharacter: () => void;
  onRemoveCharacter: (index: number) => void;
  onAddXP: () => void;
}

const CharacteristicsModal: React.FC<CharacteristicsModalProps> = ({ stats, level, xp, characterIndex, onClose, onPrevCharacter, onNextCharacter, onRemoveCharacter, onAddXP }) => {
  const [titleTapCount, setTitleTapCount] = useState(0);
  const [showXpButton, setShowXpButton] = useState(false);
  const tapTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrevCharacter();
      } else if (e.key === 'ArrowRight') {
        onNextCharacter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevCharacter, onNextCharacter]);

  const handleTitleTap = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    const newTapCount = titleTapCount + 1;
    setTitleTapCount(newTapCount);

    if (newTapCount >= 4) {
      setShowXpButton(prev => !prev);
      setTitleTapCount(0);
    } else {
      tapTimeoutRef.current = window.setTimeout(() => {
        setTitleTapCount(0);
      }, 800);
    }
  };

  const xpPercentage = level >= MAX_LEVEL ? 100 : (xp / XP_PER_LEVEL) * 100;
  const healthPercentage = stats.maxHealth > 0 ? (stats.currentHealth / stats.maxHealth) * 100 : 0;
  const healthColor = healthPercentage > 50 ? 'bg-green-600' : healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-4" onMouseDown={onClose}>
      <div 
        className="bg-[#0A100A] border-2 border-green-500/50 rounded-lg shadow-xl p-6 w-full max-w-xs space-y-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-green-300 cursor-pointer select-none" onClick={handleTitleTap}>Характеристики</h2>
            <button onClick={onClose} className="text-2xl leading-none text-green-400/70 hover:text-white">&times;</button>
        </div>
        <div className="flex items-center justify-between">
            <button onClick={onPrevCharacter} className="px-3 py-1 bg-[#1a2b1a] hover:bg-green-800 border border-green-500/70 text-green-400 rounded-md transition-colors text-xl">&lt;</button>
            <p className="text-center text-lg text-green-400">Персонаж {characterIndex + 1}</p>
            <button onClick={onNextCharacter} className="px-3 py-1 bg-[#1a2b1a] hover:bg-green-800 border border-green-500/70 text-green-400 rounded-md transition-colors text-xl">&gt;</button>
        </div>
        <div className="space-y-3 border-t border-green-800/70 pt-4">
            <div className="w-full">
                 <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-green-400/80">❤️ Здоровье:</span>
                    <span className="font-semibold text-green-400">{stats.currentHealth} / {stats.maxHealth}</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2.5 border border-green-700/60">
                    <div 
                        className={`${healthColor} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${healthPercentage}%` }}>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-green-400/80">⚔️ Урон:</span>
                <span className="font-semibold text-amber-400">{stats.damage}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-green-400/80">🛡️ Класс брони:</span>
                <span className="font-semibold text-sky-400">{stats.armor}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-green-400/80">🌟 Уровень:</span>
                <span className={`font-semibold ${level >= MAX_LEVEL ? 'text-yellow-400' : 'text-green-400'}`}>
                    {level} {level >= MAX_LEVEL ? '(MAX)' : ''}
                </span>
            </div>
            <div className="w-full">
                <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-green-400/80">✨ Опыт:</span>
                    <span className="font-semibold text-green-400">
                        {level >= MAX_LEVEL ? 'MAX' : `${xp} / ${XP_PER_LEVEL}`}
                    </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2.5 border border-green-700/60">
                    <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${xpPercentage}%` }}>
                    </div>
                </div>
            </div>
        </div>

        {showXpButton && level < MAX_LEVEL && (
             <div className="pt-2">
                 <button
                    onClick={onAddXP}
                    className="w-full px-4 py-2 bg-blue-900/80 hover:bg-blue-800/80 border border-blue-500/70 text-blue-300 rounded-md transition-colors font-semibold"
                 >
                    +250 XP
                 </button>
            </div>
        )}

        <div className="border-t border-green-800/70 pt-4">
            <button
                onClick={() => onRemoveCharacter(characterIndex)}
                className="w-full px-4 py-2 bg-amber-900/80 hover:bg-amber-800/80 border border-amber-500/70 text-amber-300 rounded-md transition-colors font-semibold"
            >
                Удалить персонажа
            </button>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsModal;