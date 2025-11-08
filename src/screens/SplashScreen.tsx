import React from 'react';

interface SplashScreenProps {
  onStartNewGame: () => void;
  onLoad: () => void;
  saveExists: boolean;
  isGameActive: boolean;
  onContinueGame: () => void;
  onSave: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStartNewGame, onLoad, saveExists, isGameActive, onContinueGame, onSave }) => {
  
  return (
    <div 
        className="w-screen h-screen bg-[#0A100A] flex flex-col items-center justify-center p-4 font-mono select-none"
    >
      <style>{`
        @keyframes flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            text-shadow:
              0 0 4px #10b981,
              0 0 11px #10b981,
              0 0 19px #10b981,
              0 0 40px #059669,
              0 0 80px #059669,
              0 0 90px #059669,
              0 0 100px #059669,
              0 0 150px #059669;
          }
          20%, 24%, 55% {        
            text-shadow: none;
          }
        }
        .title-flicker {
          animation: flicker 2.5s linear infinite;
        }
      `}</style>
      <div className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-green-400 tracking-widest title-flicker">
          НОВЫЙ РАССВЕТ
        </h1>
        <div className="flex flex-col items-center gap-4 w-64 mx-auto">
          {isGameActive && (
             <button
                onClick={onContinueGame}
                className="w-full px-6 py-3 bg-[#1a2b1a] border-2 border-green-500/70 text-green-300 rounded-md text-xl font-semibold transition-all duration-300 hover:bg-green-800 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105"
             >
                Продолжить
             </button>
          )}
          <button
            onClick={onStartNewGame}
            className="w-full px-6 py-3 bg-[#1a2b1a] border-2 border-green-500/70 text-green-300 rounded-md text-xl font-semibold transition-all duration-300 hover:bg-green-800 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105"
          >
            Новая игра
          </button>
          {isGameActive && (
             <button
                onClick={onSave}
                className="w-full px-6 py-3 bg-[#1a2b2b] border-2 border-sky-500/70 text-sky-300 rounded-md text-lg font-semibold transition-all duration-300 hover:bg-sky-800 hover:shadow-lg hover:shadow-sky-500/20 hover:scale-105"
             >
                Сохранить игру
             </button>
          )}
           <button 
              onClick={onLoad} 
              disabled={!saveExists}
              className="w-full px-6 py-3 bg-[#1a2b1a] border-2 border-green-500/70 text-green-400 rounded-md text-lg font-semibold transition-all duration-300 hover:enabled:bg-green-800 hover:enabled:shadow-lg hover:enabled:shadow-green-500/20 hover:enabled:scale-105 disabled:bg-gray-800/50 disabled:text-gray-500 disabled:border-gray-600 disabled:cursor-not-allowed"
            >
              Загрузить игру
            </button>
        </div>
      </div>
       <footer className="absolute bottom-4 text-center text-green-800/80 text-sm">
        <p>Кликните в любом месте, чтобы включить музыку</p>
      </footer>
    </div>
  );
};

export default SplashScreen;