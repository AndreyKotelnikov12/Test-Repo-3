import React from 'react';
import { CombatUnit as CombatUnitType } from '../types';
import HealthBar from './HealthBar';

interface CombatUnitProps {
  unit: CombatUnitType;
  isSelected: boolean;
  onClick: () => void;
  animation: { attackerId: string, targetId: string } | null;
}

const GRID_WIDTH = 8;
const GRID_HEIGHT = 10;

const CombatUnitComponent: React.FC<CombatUnitProps> = ({ unit, isSelected, onClick, animation }) => {
  const isDefeated = unit.currentHealth <= 0;

  const borderClass = isSelected ? 'border-yellow-400' : unit.isPlayer ? 'border-green-500' : 'border-red-500';
  const opacityClass = unit.hasTakenTurn && unit.isPlayer ? 'opacity-60' : 'opacity-100';
  const defeatedClass = isDefeated ? 'opacity-0 scale-75' : '';
  const zIndex = isSelected ? 20 : isDefeated ? 5 : 10;

  const isAttacking = animation?.attackerId === unit.id;
  const isDefending = animation?.targetId === unit.id;
  const animationClass = isAttacking ? 'animate-attack' : isDefending ? 'animate-defend' : '';

  return (
    <div
      className={`absolute flex flex-col items-center justify-center p-1 bg-black/60 border-2 ${borderClass} rounded-md transition-all duration-500 transform ${opacityClass} ${isSelected ? 'scale-110' : 'hover:scale-105'} ${animationClass} ${defeatedClass}`}
      style={{
        width: `${100 / GRID_WIDTH}%`,
        height: `${100 / GRID_HEIGHT}%`,
        top: `${unit.gridPosition.y * (100 / GRID_HEIGHT)}%`,
        left: `${unit.gridPosition.x * (100 / GRID_WIDTH)}%`,
        cursor: !isDefeated ? 'pointer' : 'not-allowed',
        zIndex: zIndex,
        pointerEvents: animation || isDefeated ? 'none' : 'auto',
      }}
      onClick={!isDefeated ? onClick : undefined}
    >
      <div className="text-2xl md:text-3xl" style={{ filter: `drop-shadow(0 0 5px ${unit.isPlayer ? '#4ade80' : '#f87171'})` }}>
        {unit.icon}
      </div>
      <div className="w-full mt-1 px-1 absolute bottom-1">
        <HealthBar current={unit.currentHealth} max={unit.maxHealth} />
      </div>
    </div>
  );
};

export default CombatUnitComponent;