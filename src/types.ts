export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  MISCELLANEOUS = 'MISCELLANEOUS',
  RESOURCE = 'RESOURCE',
  QUEST = 'QUEST',
}

export interface Item {
  id: number;
  stackId: string; // Unique identifier for each stack instance
  name: string;
  type: ItemType;
  icon: string;
  description: string;
  quantity: number;
  damage?: number;
  armor?: number;
  effect?: string;
  price?: number;
  use?: string; // e.g., 'HEAL_SQUAD_2HP'
}

export interface MapItem extends Item {
  position: { x: number; y: number };
  expiresAt?: number;
}

export interface Character {
  weapon: Item | null;
  armor: Item | null;
  level: number;
  xp: number;
  currentHealth: number;
  maxHealth: number;
}

export interface CharacterStats {
  currentHealth: number;
  maxHealth: number;
  damage: number;
  armor: number;
}

export interface Faction {
  id: string;
  name: string;
  icon: string;
  color: string;
  characters: Character[];
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  defeatedUntil: number | null;
  aiState: 'idle' | 'pursuing';
  pursueUntil: number | null;
}

export interface Quest {
  id: string;
  giverCityId: string;
  giverName: string;
  cityName: string;
  itemId: number;
  itemName: string;
  itemIcon: string;
  requiredQuantity: number;
  rewardSilver: number;
  description: string;
  status: 'active' | 'completed';
}

export type MainQuestState = 'not_started' | 'find_chip' | 'completed';

// --- New Combat Types ---

export interface CombatUnit {
  id: string;
  // For players, baseCharacter links back to the main character array.
  // For enemies, we can store their original index in the faction.
  originalCharacter: Character; 
  originalIndex: number;
  icon: string;
  isPlayer: boolean;
  gridPosition: { x: number; y: number };
  maxHealth: number;
  currentHealth: number;
  damage: number;
  armor: number;
  hasTakenTurn: boolean;
}

export interface CombatState {
  playerUnits: CombatUnit[];
  enemyUnits: CombatUnit[];
  turn: 'player' | 'enemy' | 'enemy-acting' | 'game-over';
  round: number;
}