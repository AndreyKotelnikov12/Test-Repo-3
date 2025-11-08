import React from 'react';

interface IntroScreenProps {
  onEnd: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onEnd }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in font-mono p-4">
      <div 
        className="bg-[#0A100A] border-2 border-green-500/50 rounded-lg shadow-xl p-6 w-full max-w-lg text-center space-y-6"
      >
        <header className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 flex items-center justify-center bg-black/30 rounded-full border-2 border-green-700/60 flex-shrink-0">
                <span className="text-6xl" role="img" aria-label="Старейшина">👳‍♂️</span>
            </div>
            <h1 className="text-3xl font-bold text-green-400 tracking-wider">Старейшина Оазиса</h1>
        </header>

        <main className="space-y-4">
            <p className="text-lg text-green-300 italic">"Путник, я рад, что ты здесь. Наш Оазис на грани гибели."</p>
            <p className="text-base text-green-400/80">
                "Устройство, что давало нам чистую воду, сломалось. Его сердце — <span className="font-bold text-yellow-300">Водный чип</span> — утеряно в Пустошах. Без него мы все погибнем от жажды."
            </p>
            <p className="text-base text-green-400/80">
                "Прошу, найди его. Это наша единственная надежда. Судьба Оазиса в твоих руках."
            </p>
        </main>
        
        <footer className="pt-4">
            <button 
                onClick={onEnd} 
                className="w-full max-w-xs mx-auto px-6 py-3 bg-[#1a2b1a] hover:bg-green-800 border-2 border-green-500/70 text-green-300 rounded-md text-xl font-semibold transition-colors animate-pulse"
            >
                Начать поиски
            </button>
        </footer>
      </div>
    </div>
  );
};

export default IntroScreen;