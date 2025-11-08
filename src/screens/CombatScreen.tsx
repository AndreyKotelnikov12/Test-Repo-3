import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CombatState, CombatUnit } from '../types';
import CombatUnitComponent from '../components/CombatUnit';
import { playAttackSound } from '../utils/music';

interface CombatScreenProps {
  initialState: CombatState;
  onCombatEnd: (result: 'win' | 'lose', finalState: CombatState) => void;
}

const GRID_WIDTH = 8;
const GRID_HEIGHT = 10;
const ANIMATION_DURATION = 400;
const AI_ACTION_DELAY = 500;
const TURN_DURATION = 20;

const isSingleStepMove = (from: {x:number, y:number}, to: {x:number, y:number}) => {
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    return dx <= 1 && dy <= 1 && (dx !== 0 || dy !== 0);
};

const CombatScreen: React.FC<CombatScreenProps> = ({ initialState, onCombatEnd }) => {
  const [combatState, setCombatState] = useState<CombatState>(initialState);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [message, setMessage] = useState('Ваш ход! Выберите бойца.');
  const [animation, setAnimation] = useState<{ attackerId: string; targetId: string; } | null>(null);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(TURN_DURATION);
  const timerRef = useRef<number | null>(null);
  const combatEndedRef = useRef(false);
  const [titleTapCount, setTitleTapCount] = useState(0);
  const [showWinButton, setShowWinButton] = useState(false);
  const tapTimeoutRef = useRef<number | null>(null);
  
  const combatStateRef = useRef(combatState);
  combatStateRef.current = combatState;
  
  const allUnits = useMemo(() => [...combatState.playerUnits, ...combatState.enemyUnits], [combatState.playerUnits, ...combatState.enemyUnits]);
  const selectedUnit = useMemo(() => allUnits.find(u => u.id === selectedUnitId), [allUnits, selectedUnitId]);

  const endPlayerTurn = useCallback(() => {
    setMessage('Ход противника...');
    setSelectedUnitId(null);
    setCombatState(prev => ({ ...prev, turn: 'enemy' }));
  }, []);

  // Timer Management Effect
  useEffect(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
    
    const currentUnit = allUnits.find(u => u.id === selectedUnitId);
    
    if (combatState.turn === 'player' && currentUnit && !currentUnit.hasTakenTurn) {
        setTurnTimeRemaining(TURN_DURATION);
        
        timerRef.current = window.setInterval(() => {
            setTurnTimeRemaining(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    clearInterval(timerRef.current!);
                    setMessage(`Время вышло! Ход бойца #${currentUnit.originalIndex + 1} пропущен.`);
                    setCombatState(prev => ({
                        ...prev,
                        playerUnits: prev.playerUnits.map(p =>
                            p.id === currentUnit.id ? { ...p, hasTakenTurn: true } : p
                        )
                    }));
                    return 0;
                }
                return newTime;
            });
        }, 1000);
    }
    
    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
}, [combatState.turn, selectedUnitId, allUnits]);


  useEffect(() => {
    if (combatState.turn !== 'player' || animation) {
        return;
    }

    const livingPlayers = combatState.playerUnits.filter(u => u.currentHealth > 0);
    if (livingPlayers.every(u => u.hasTakenTurn)) {
        endPlayerTurn();
        return;
    }

    const nextUnit = combatState.playerUnits.find(u => u.currentHealth > 0 && !u.hasTakenTurn);
    
    if (nextUnit) {
        if (selectedUnitId !== nextUnit.id) {
            setSelectedUnitId(nextUnit.id);
            setMessage(`Ход бойца #${nextUnit.originalIndex + 1}.`);
        }
    } else {
        endPlayerTurn();
    }
  }, [combatState.turn, combatState.playerUnits, animation, endPlayerTurn, selectedUnitId]);


  const handleUnitClick = (unit: CombatUnit) => {
    if (combatState.turn !== 'player' || animation || !selectedUnit || selectedUnit.hasTakenTurn) return;
    
    if (!unit.isPlayer && isSingleStepMove(selectedUnit.gridPosition, unit.gridPosition)) {
      setAnimation({ attackerId: selectedUnit.id, targetId: unit.id });
      playAttackSound();
      
      window.setTimeout(() => {
          setCombatState(prev => {
              const newEnemies = prev.enemyUnits.map(e => 
                  e.id === unit.id ? { ...e, currentHealth: Math.max(0, e.currentHealth - selectedUnit.damage) } : e
              );

              const newPlayers = prev.playerUnits.map(p => 
                  p.id === selectedUnit.id ? { ...p, hasTakenTurn: true } : p
              );
              return { ...prev, enemyUnits: newEnemies, playerUnits: newPlayers };
          });
          setMessage(`Атака! ${unit.icon} получает ${selectedUnit.damage} урона.`);
          setAnimation(null);
      }, ANIMATION_DURATION);
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (!selectedUnit || selectedUnit.hasTakenTurn || combatState.turn !== 'player' || animation) return;
    
    const isOccupied = allUnits.some(u => u.gridPosition.x === x && u.gridPosition.y === y && u.currentHealth > 0);
    if (isOccupied) return;

    if (isSingleStepMove(selectedUnit.gridPosition, {x, y})) {
      setCombatState(prev => ({
        ...prev,
        playerUnits: prev.playerUnits.map(p => 
          p.id === selectedUnit.id ? { ...p, gridPosition: {x, y}, hasTakenTurn: true } : p
        )
      }));
      setMessage(`Боец #${selectedUnit.originalIndex + 1} перемещается.`);
    }
  };
  
  useEffect(() => {
    if (combatState.turn === 'enemy') {
        const enemyQueue = combatState.enemyUnits
            .filter(u => u.currentHealth > 0)
            .map(u => u.id);

        const processNextAction = () => {
            if (enemyQueue.length === 0) {
                setMessage('Ваш ход!');
                setCombatState(prev => ({
                    ...prev,
                    turn: 'player',
                    round: prev.round + 1,
                    playerUnits: prev.playerUnits.map(p => ({ ...p, hasTakenTurn: false })),
                }));
                return;
            }

            const currentEnemyId = enemyQueue.shift()!;
            const currentState = combatStateRef.current;
            const allCurrentUnits = [...currentState.playerUnits, ...currentState.enemyUnits];
            const currentEnemy = allCurrentUnits.find(u => u.id === currentEnemyId);
            const livingPlayerUnits = currentState.playerUnits.filter(p => p.currentHealth > 0);

            if (!currentEnemy || livingPlayerUnits.length === 0) {
                window.setTimeout(processNextAction, 100);
                return;
            }

            let target: CombatUnit | null = null;
            let minDistance = Infinity;
            for (const playerUnit of livingPlayerUnits) {
                const distance = Math.max(Math.abs(playerUnit.gridPosition.x - currentEnemy.gridPosition.x), Math.abs(playerUnit.gridPosition.y - currentEnemy.gridPosition.y));
                if (distance < minDistance) {
                    minDistance = distance;
                    target = playerUnit;
                }
            }

            if (!target) {
                window.setTimeout(processNextAction, 100);
                return;
            }

            if (isSingleStepMove(currentEnemy.gridPosition, target.gridPosition)) {
                setAnimation({ attackerId: currentEnemy.id, targetId: target.id });
                playAttackSound();
                window.setTimeout(() => {
                    setCombatState(prev => ({
                        ...prev,
                        playerUnits: prev.playerUnits.map(p =>
                            p.id === target!.id ? { ...p, currentHealth: Math.max(0, p.currentHealth - currentEnemy.damage) } : p
                        )
                    }));
                    setMessage(`${currentEnemy.icon} атакует! Вы получаете ${currentEnemy.damage} урона.`);
                    setAnimation(null);
                    window.setTimeout(processNextAction, AI_ACTION_DELAY);
                }, ANIMATION_DURATION);
            } else {
                let newPos = { ...currentEnemy.gridPosition };
                const dx = target.gridPosition.x - currentEnemy.gridPosition.x;
                const dy = target.gridPosition.y - currentEnemy.gridPosition.y;
                if (dx !== 0) newPos.x += Math.sign(dx);
                if (dy !== 0) newPos.y += Math.sign(dy);

                const isOccupied = allCurrentUnits.some(u => u.gridPosition.x === newPos.x && u.gridPosition.y === newPos.y && u.currentHealth > 0);

                if (!isOccupied) {
                    setMessage(`${currentEnemy.icon} перемещается.`);
                    setCombatState(prev => ({
                        ...prev,
                        enemyUnits: prev.enemyUnits.map(e => e.id === currentEnemy.id ? { ...e, gridPosition: newPos } : e)
                    }));
                }
                window.setTimeout(processNextAction, AI_ACTION_DELAY);
            }
        };

        window.setTimeout(processNextAction, AI_ACTION_DELAY);
    }
  }, [combatState.turn]);

  useEffect(() => {
    if (combatState.turn === 'game-over' || combatEndedRef.current) return;
    const isPlayerVictory = combatState.enemyUnits.every(u => u.currentHealth <= 0);
    const isEnemyVictory = combatState.playerUnits.every(u => u.currentHealth <= 0);

    if (isPlayerVictory) {
      combatEndedRef.current = true;
      setMessage("Победа!");
      const finalState = { ...combatState, turn: 'game-over' as const };
      setCombatState(finalState);
      window.setTimeout(() => onCombatEnd('win', finalState), 2000);
    } else if (isEnemyVictory) {
      combatEndedRef.current = true;
      setMessage("Поражение...");
      const finalState = { ...combatState, turn: 'game-over' as const };
      setCombatState(finalState);
      window.setTimeout(() => onCombatEnd('lose', finalState), 2000);
    }
  }, [combatState, onCombatEnd]);

  const handleTitleTap = () => {
      if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
      }
      
      const newTapCount = titleTapCount + 1;
      setTitleTapCount(newTapCount);

      if (newTapCount >= 4) {
          setShowWinButton(prev => !prev);
          setTitleTapCount(0);
      } else {
          tapTimeoutRef.current = window.setTimeout(() => {
              setTitleTapCount(0);
          }, 800);
      }
  };

  const handleWinButtonClick = () => {
    if (combatState.turn === 'game-over') return;
    setShowWinButton(false);
    setCombatState(prev => ({
      ...prev,
      enemyUnits: prev.enemyUnits.map(u => ({ ...u, currentHealth: 0 })),
    }));
  };

  return (
    <div className="w-screen h-screen bg-[#0a1a0a] flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-green-400 cursor-pointer select-none" onClick={handleTitleTap}>
                ТАКТИЧЕСКИЙ БОЙ
            </h1>
            <div className="h-8 flex items-center justify-center gap-4">
              <p className="text-lg text-amber-300">{message}</p>
              {combatState.turn === 'player' && selectedUnit && !selectedUnit.hasTakenTurn && (
                <div className={`text-xl font-bold p-1 rounded-md ${turnTimeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                    ⏳ {turnTimeRemaining}
                </div>
              )}
            </div>
        </div>

        <div className="relative w-full max-w-lg aspect-[8/10] bg-black/30 border-2 border-green-500/50">
            {[...Array(GRID_HEIGHT)].map((_, y) => (
                <div key={y} className="flex h-[10%]">
                    {[...Array(GRID_WIDTH)].map((_, x) => {
                        const isHighlighted = selectedUnit && !selectedUnit.hasTakenTurn && isSingleStepMove(selectedUnit.gridPosition, {x,y}) && !allUnits.some(u => u.gridPosition.x === x && u.gridPosition.y === y && u.currentHealth > 0);
                        return (
                            <div
                                key={x}
                                className={`w-[12.5%] border border-green-900/50 transition-colors ${isHighlighted ? 'bg-green-500/20' : ''}`}
                                onClick={() => handleCellClick(x, y)}
                            />
                        );
                    })}
                </div>
            ))}
            {allUnits.map(unit => (
                <CombatUnitComponent key={unit.id} unit={unit} isSelected={unit.id === selectedUnitId} onClick={() => handleUnitClick(unit)} animation={animation} />
            ))}
        </div>
        {showWinButton && (
            <div className="mt-4">
                <button
                    onClick={handleWinButtonClick}
                    className="px-4 py-2 bg-amber-900/80 hover:bg-amber-800/80 border border-amber-500/70 text-amber-300 rounded-md transition-colors font-semibold"
                >
                    Завершить бой (Победа)
                </button>
            </div>
        )}
    </div>
  );
};

export default CombatScreen;