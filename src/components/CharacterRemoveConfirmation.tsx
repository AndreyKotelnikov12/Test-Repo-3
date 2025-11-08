import React, { useEffect } from 'react';

interface CharacterRemoveConfirmationProps {
  characterIndex: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const CharacterRemoveConfirmation: React.FC<CharacterRemoveConfirmationProps> = ({ characterIndex, onConfirm, onCancel }) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in font-mono p-4" onMouseDown={onCancel}>
      <div 
        className="bg-[#0A100A] border-2 border-amber-500/50 rounded-lg shadow-xl p-6 w-full max-w-xs space-y-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-black/30 rounded-md border border-amber-700/60">
            <span className="text-4xl">🗑️</span>
          </div>
          <h2 className="text-xl font-bold text-amber-300">Подтверждение</h2>
          <p className="text-sm text-green-300">
            Вы уверены, что хотите удалить <span className="font-semibold text-yellow-400">Персонажа {characterIndex + 1}</span>?
          </p>
           <p className="text-xs text-gray-500">Это действие необратимо. Вся экипировка вернется в инвентарь.</p>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onCancel} className="px-5 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 rounded-md transition-colors text-gray-300">Отмена</button>
          <button onClick={onConfirm} className="px-5 py-2 bg-amber-800 hover:bg-amber-700 border border-amber-500/70 text-amber-200 rounded-md transition-colors font-semibold">Удалить</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterRemoveConfirmation;