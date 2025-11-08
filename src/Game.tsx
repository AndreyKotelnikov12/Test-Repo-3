import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Item, ItemType, MapItem, CharacterStats, Character, Faction, CombatState, CombatUnit, Quest, MainQuestState } from './types';
import { INITIAL_ITEMS, MAX_LEVEL, XP_PER_LEVEL, BATTLE_REWARDS_POOL, MAP_WIDTH, MAP_HEIGHT, CITIES, QUEST_ITEM_POOL_IDS } from './constants';
import MapScreen from './screens/MapScreen';
import InventoryScreen from './screens/InventoryScreen';
import CombatScreen from './screens/CombatScreen';
import CharacteristicsModal from './components/CharacteristicsModal';
import CharacterRemoveConfirmation from './components/CharacterRemoveConfirmation';
import CombatEndScreen from './components/CombatEndScreen';
import CityScreen from './screens/CityScreen';
import SplashScreen from './screens/SplashScreen';
import musicController, { mapMusicController, victoryMusicController, defeatMusicController, introMusicController, questCompleteMusicController } from './utils/music';
import QuestLogScreen from './components/QuestLogScreen';
import IntroScreen from './screens/IntroScreen';
import { saveGameState, loadGameState, checkSaveExists, clearSave } from './utils/storage';


const generateInitialCharacters = (): Character[] => {
    const knifeTemplate = INITIAL_ITEMS.find(item => item.id === 9); // Кинжал
    return Array(5).fill(null).map(() => {
        const initialLevel = 0;
        const initialMaxHealth = 12 + (initialLevel * 3);
        return {
            weapon: knifeTemplate ? {
                ...knifeTemplate,
                id: 9,
                stackId: crypto.randomUUID(),
                quantity: 1,
            } : null,
            armor: null,
            level: initialLevel,
            xp: 0,
            maxHealth: initialMaxHealth,
            currentHealth: initialMaxHealth,
        };
    });
};

const generateInitialInventory = (): Item[] => {
    return []; // Start with an empty inventory as knives are now equipped
};

const generateInitialMerchantInventory = (): Item[] => {
    const inventory: Item[] = [];
    const numItems = 20;
    const addedIds = new Set<number>();
    
    while(inventory.length < numItems && addedIds.size < BATTLE_REWARDS_POOL.length) {
        const randomItemTemplate = BATTLE_REWARDS_POOL[Math.floor(Math.random() * BATTLE_REWARDS_POOL.length)];
        
        if (randomItemTemplate.type !== ItemType.QUEST && !addedIds.has(randomItemTemplate.id)) {
             const quantity = (randomItemTemplate.type === ItemType.WEAPON || randomItemTemplate.type === ItemType.ARMOR)
                ? 1
                : (Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 1);

             inventory.push({
                ...randomItemTemplate,
                stackId: crypto.randomUUID(),
                quantity: quantity,
            });
            addedIds.add(randomItemTemplate.id);
        }
    }
    return inventory;
};

const generateInitialMerchantInventories = (): Record<string, Item[]> => {
    const inventories: Record<string, Item[]> = {};
    CITIES.forEach(city => {
        inventories[city.id] = generateInitialMerchantInventory();
    });
    return inventories;
};

const POST_APOCALYPTIC_FACTIONS = [
    { name: 'Мародеры Пустошей', icon: '🤠', color: '#ca8a04' },
    { name: 'Мутанты-бродяги', icon: '🧟', color: '#16a34a' },
    { name: 'Ржавые Болты', icon: '🤖', color: '#a8a29e' },
    { name: 'Культисты Ржавчины', icon: '⚙️', color: '#b91c1c' },
    { name: 'Дикие гули', icon: '💀', color: '#78716c' },
    { name: 'Стая рад-псов', icon: '🐕', color: '#eab308' },
    { name: 'Токсичные скитальцы', icon: '🤢', color: '#84cc16' },
    { name: 'Каннибалы', icon: '🍽️', color: '#dc2626' },
    { name: 'Мусорщики', icon: '🗑️', color: '#64748b' },
    { name: 'Гигантские насекомые', icon: '🐜', color: '#4d7c0f' },
];


const getRandomCornerPosition = (): { x: number; y: number } => {
    const margin = 20; // Increased margin for larger map
    const corner = Math.floor(Math.random() * 4);
    let x, y;

    switch (corner) {
        case 0: // Top-left
            x = margin + Math.random() * 30;
            y = margin + Math.random() * 30;
            break;
        case 1: // Top-right
            x = MAP_WIDTH - margin - Math.random() * 30;
            y = margin + Math.random() * 30;
            break;
        case 2: // Bottom-left
            x = margin + Math.random() * 30;
            y = margin + Math.random() * 30;
            break;
        case 3: // Bottom-right
        default:
            x = MAP_WIDTH - margin - Math.random() * 30;
            y = MAP_HEIGHT - margin - Math.random() * 30;
            break;
    }
    return { x, y };
};

const generateFaction = (data: { name: string, icon: string, color: string }): Faction => {
    const numCharacters = Math.floor(Math.random() * 5) + 1;
    const characters: Character[] = Array(numCharacters).fill(null).map(() => ({
        weapon: null,
        armor: null,
        level: 1,
        xp: 0,
        maxHealth: 15,
        currentHealth: 15,
    }));
    const position = getRandomCornerPosition();
    return {
        id: crypto.randomUUID(),
        ...data,
        characters,
        position,
        targetPosition: position,
        defeatedUntil: null,
        aiState: 'idle',
        pursueUntil: null,
    };
};

const generateInitialFactions = (): Faction[] => {
    const factions: Faction[] = [];
    for (let i = 0; i < 10; i++) {
        const factionData = POST_APOCALYPTIC_FACTIONS[Math.floor(Math.random() * POST_APOCALYPTIC_FACTIONS.length)];
        factions.push(generateFaction(factionData));
    }
    return factions;
};

const GRID_WIDTH = 8;
const GRID_HEIGHT = 10;
const CITY_RADIUS = 5;


function Game() {
    const [gameState, setGameState] = useState<'splash' | 'playing'>('splash');
    const [isGameActive, setIsGameActive] = useState(false);
    const [currentScreen, setCurrentScreen] = useState<'map' | 'inventory' | 'combat' | 'city'>('map');
    const [showCharacteristics, setShowCharacteristics] = useState(false);
    const [characterIndexToRemove, setCharacterIndexToRemove] = useState<number | null>(null);

    // Game State
    const [inventory, setInventory] = useState<Item[]>(generateInitialInventory());
    const [merchantInventories, setMerchantInventories] = useState<Record<string, Item[]>>(() => generateInitialMerchantInventories());
    const [currentCityId, setCurrentCityId] = useState<string | null>(null);
    const [silver, setSilver] = useState(100);
    const [characters, setCharacters] = useState<Character[]>(generateInitialCharacters());
    const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);
    const [mapItems, setMapItems] = useState<MapItem[]>([]);
    const [factions, setFactions] = useState<Faction[]>(generateInitialFactions());
    const [characterPosition, setCharacterPosition] = useState({ x: 100, y: 100 }); // Start in the middle
    const [saveExists, setSaveExists] = useState(false);
    const [logMessages, setLogMessages] = useState<string[]>([]);
    const [targetItemToPickup, setTargetItemToPickup] = useState<MapItem | null>(null);
    const [combatState, setCombatState] = useState<CombatState | null>(null);
    const [activeCombatFactionId, setActiveCombatFactionId] = useState<string | null>(null);
    const [combatResult, setCombatResult] = useState<{ result: 'win' | 'lose'; xpAwarded: number; rewardItem?: Item } | null>(null);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [showQuestLog, setShowQuestLog] = useState(false);
    const [mainQuestState, setMainQuestState] = useState<MainQuestState>('not_started');
    const [showIntroScreen, setShowIntroScreen] = useState(false);

    
    const characterPositionRef = useRef(characterPosition);
    characterPositionRef.current = characterPosition;
    const currentScreenRef = useRef(currentScreen);
    currentScreenRef.current = currentScreen;
    const factionsRef = useRef(factions);
    factionsRef.current = factions;
    const charactersRef = useRef(characters);
    charactersRef.current = characters;
    const combatStateRef = useRef(combatState);
    combatStateRef.current = combatState;
    const gameLoopIntervalRef = useRef<number | null>(null);
    const lastItemSpawnRef = useRef<number>(0);
    const currentlyPlayingMusic = useRef<string | null>(null);
    
    // Refresh merchant inventory on city entry
    useEffect(() => {
        if (currentCityId) {
            setMerchantInventories(prev => ({
                ...prev,
                [currentCityId]: generateInitialMerchantInventory(),
            }));
        }
    }, [currentCityId]);

    // Audio resume handler
    useEffect(() => {
        const handleUserInteraction = () => {
            musicController.resume();
            mapMusicController.resume();
            victoryMusicController.resume();
            defeatMusicController.resume();
            introMusicController.resume();
            questCompleteMusicController.resume();
        };
        window.addEventListener('click', handleUserInteraction);
        return () => {
            window.removeEventListener('click', handleUserInteraction);
        };
    }, []);

    // Centralized music management
    useEffect(() => {
        const stopAllMusic = () => {
            musicController.stop();
            mapMusicController.stop();
            victoryMusicController.stop();
            defeatMusicController.stop();
            introMusicController.stop();
            questCompleteMusicController.stop();
        };
    
        let musicToPlay: string | null = null;
        if (showIntroScreen) {
            musicToPlay = 'intro';
        } else if (gameState === 'splash') {
            musicToPlay = 'splash';
        } else if (gameState === 'playing') {
            if (combatResult) {
                musicToPlay = combatResult.result === 'win' ? 'victory' : 'defeat';
            } else { // map, inventory, city
                musicToPlay = 'map';
            }
        }
    
        if (musicToPlay !== currentlyPlayingMusic.current) {
            stopAllMusic();
    
            if (musicToPlay === 'splash') {
                musicController.start();
            } else if (musicToPlay === 'map') {
                mapMusicController.start();
            } else if (musicToPlay === 'victory') {
                victoryMusicController.start();
            } else if (musicToPlay === 'defeat') {
                defeatMusicController.start();
            } else if (musicToPlay === 'intro') {
                introMusicController.start();
            }
    
            currentlyPlayingMusic.current = musicToPlay;
        }
    }, [gameState, currentScreen, combatResult, showIntroScreen]);
    
    const addLogMessage = (message: string) => {
        setLogMessages(prev => {
            const newMessages = [...prev, message];
            if (newMessages.length > 50) {
                return newMessages.slice(newMessages.length - 50);
            }
            return newMessages;
        });
    };

    useEffect(() => {
        // @ts-ignore
        if (window.Telegram && window.Telegram.WebApp) {
            // @ts-ignore
            window.Telegram.WebApp.ready();
        }
        checkSaveExists().then(exists => {
            setSaveExists(exists);
        });
    }, []);
    
    const handlePickupItem = (pickedUpItem: MapItem) => {
        setInventory(prevInventory => {
            const isStackable = pickedUpItem.type === ItemType.RESOURCE || pickedUpItem.type === ItemType.MISCELLANEOUS;
            if (isStackable) {
                const existingStack = prevInventory.find(item => item.id === pickedUpItem.id);
                if (existingStack) {
                    return prevInventory.map(item =>
                        item.stackId === existingStack.stackId
                            ? { ...item, quantity: item.quantity + pickedUpItem.quantity }
                            : item
                    );
                }
            }
            // Create a new item without the map-specific properties
            const { position, expiresAt, ...inventoryItem } = pickedUpItem;
            return [...prevInventory, { ...inventoryItem, stackId: crypto.randomUUID() }];
        });
        setMapItems(prevMapItems => prevMapItems.filter(item => item.stackId !== pickedUpItem.stackId));
        addLogMessage(`Вы подобрали: ${pickedUpItem.name} (x${pickedUpItem.quantity})`);
    };

    useEffect(() => {
        if (!targetItemToPickup) return;
        const dx = characterPosition.x - targetItemToPickup.position.x;
        const dy = characterPosition.y - targetItemToPickup.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const PICKUP_DISTANCE = 3; 

        if (distance < PICKUP_DISTANCE) {
            handlePickupItem(targetItemToPickup);
            setTargetItemToPickup(null); 
        }
    }, [characterPosition, targetItemToPickup]);
    
    const handleAddXP = (characterIndex: number, amount: number) => {
        setCharacters(prev => {
            const newCharacters = [...prev];
            const character = { ...newCharacters[characterIndex] };
            if (character.level >= MAX_LEVEL) return prev;
            character.xp += amount;
            let leveledUp = false;
            while (character.xp >= XP_PER_LEVEL && character.level < MAX_LEVEL) {
                character.xp -= XP_PER_LEVEL;
                character.level += 1;
                leveledUp = true;
            }

            if(leveledUp) {
                const newMaxHealth = 12 + (character.level * 3);
                const healthIncrease = newMaxHealth - character.maxHealth;
                character.maxHealth = newMaxHealth;
                character.currentHealth = Math.min(character.maxHealth, character.currentHealth + healthIncrease);
                addLogMessage(`Персонаж ${characterIndex + 1} достиг ${character.level} уровня! Здоровье увеличено.`);
            }

            if (character.level >= MAX_LEVEL) character.xp = 0;
            newCharacters[characterIndex] = character;
            return newCharacters;
        });
    };

    useEffect(() => {
        if (gameState !== 'playing') {
            if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
            return; 
        }

        lastItemSpawnRef.current = Date.now();

        const gameLoop = window.setInterval(() => {
            if (currentScreenRef.current !== 'map') return;
            const playerPos = characterPositionRef.current;
            const now = Date.now();
            let combatStarted = false;

            setMapItems(currentMapItems => currentMapItems.filter(item => {
                if (item.expiresAt && now > item.expiresAt) {
                    addLogMessage(`Предмет ${item.name} исчез.`);
                    return false;
                }
                return true;
            }));

            // Main Quest Item Spawn Logic
            const waterChipExists = mapItems.some(item => item.id === 301) || inventory.some(item => item.id === 301);
            if (mainQuestState === 'find_chip' && !waterChipExists) {
                const SPAWN_CHANCE = 0.001; // Very low chance per tick
                if (Math.random() < SPAWN_CHANCE) {
                    const waterChipTemplate = BATTLE_REWARDS_POOL.find(i => i.id === 301);
                    if (waterChipTemplate) {
                        const newItem: MapItem = {
                            ...(waterChipTemplate as Item),
                            stackId: crypto.randomUUID(),
                            quantity: 1,
                            position: {
                                x: Math.random() * (MAP_WIDTH - 20) + 10,
                                y: Math.random() * (MAP_HEIGHT - 20) + 10,
                            },
                            expiresAt: now + 5000,
                        };
                        setMapItems(prev => [...prev, newItem]);
                        addLogMessage(`Что-то блеснуло на горизонте...`);
                    }
                }
            }


            const SPAWN_INTERVAL = 20000;
            if (now - lastItemSpawnRef.current > SPAWN_INTERVAL) {
                setMapItems(currentMapItems => {
                    if (currentMapItems.some(item => item.expiresAt)) {
                        lastItemSpawnRef.current = now;
                        return currentMapItems;
                    }
                    
                    const templates = [
                        BATTLE_REWARDS_POOL.find(i => i.id === 101), // Ржавый кинжал
                        BATTLE_REWARDS_POOL.find(i => i.id === 201)  // Стимулятор
                    ].filter(Boolean);
            
                    if (templates.length > 0) {
                        const templateToSpawn = templates[Math.floor(Math.random() * templates.length)];
                        const newItem: MapItem = {
                            ...(templateToSpawn as Item),
                            stackId: crypto.randomUUID(),
                            quantity: 1,
                            position: {
                                x: Math.random() * (MAP_WIDTH - 20) + 10,
                                y: Math.random() * (MAP_HEIGHT - 20) + 10,
                            },
                            expiresAt: now + 10000,
                        };
                        addLogMessage(`На карте появился предмет: ${newItem.name}!`);
                        lastItemSpawnRef.current = now;
                        return [...currentMapItems, newItem];
                    }
                    return currentMapItems;
                });
            }

            for (const city of CITIES) {
                const dxCity = city.position.x - playerPos.x;
                const dyCity = city.position.y - playerPos.y;
                const distCity = Math.sqrt(dxCity*dxCity + dyCity*dyCity);
                if (distCity < CITY_RADIUS) {
                    setCurrentCityId(city.id);
                    setCurrentScreen('city');
                    return;
                }
            }

            for (const faction of factionsRef.current) {
                if (faction.defeatedUntil) continue;

                const dxCombat = faction.position.x - playerPos.x;
                const dyCombat = faction.position.y - playerPos.y;
                const distanceCombat = Math.sqrt(dxCombat * dxCombat + dyCombat * dyCombat);
                const CONTACT_DISTANCE = 4;

                if (distanceCombat < CONTACT_DISTANCE) {
                    addLogMessage(`Столкновение с фракцией "${faction.name}"!`);
                    
                    const playerUnitsOnGrid = charactersRef.current;
                    const playerStartX = Math.floor((GRID_WIDTH - playerUnitsOnGrid.length) / 2);

                    const totalPlayerDamage = playerUnitsOnGrid.reduce((sum, char) => sum + (char.weapon?.damage || 1), 0);
                    const averagePlayerDamage = playerUnitsOnGrid.length > 0 ? Math.round(totalPlayerDamage / playerUnitsOnGrid.length) : 5;
                    const enemyDamage = Math.max(1, averagePlayerDamage);

                    const playerCombatUnits: CombatUnit[] = playerUnitsOnGrid.map((char, index) => {
                        const charDamage = char.weapon?.damage || 1;
                        const charArmor = char.armor?.armor || 0;
                        return {
                            id: `player-${index}`,
                            originalCharacter: char,
                            originalIndex: index,
                            icon: '🚶',
                            isPlayer: true,
                            gridPosition: { x: playerStartX + index, y: GRID_HEIGHT - 2 },
                            maxHealth: char.maxHealth,
                            currentHealth: char.currentHealth,
                            damage: charDamage,
                            armor: charArmor,
                            hasTakenTurn: false,
                        };
                    });
                    
                    const ENEMY_COUNT = 5;
                    const enemyStartX = Math.floor((GRID_WIDTH - ENEMY_COUNT) / 2);

                    const averagePlayerLevel = playerUnitsOnGrid.length > 0 
                        ? Math.round(playerUnitsOnGrid.reduce((sum, char) => sum + char.level, 0) / playerUnitsOnGrid.length) 
                        : 1;
                    const enemyMaxHealth = 12 + (averagePlayerLevel * 3);

                    const enemyCombatUnits: CombatUnit[] = Array.from({ length: ENEMY_COUNT }).map((_, index) => {
                        const enemyCharacter: Character = {
                            weapon: null,
                            armor: null,
                            level: faction.characters[0]?.level || 1,
                            xp: 0,
                            maxHealth: enemyMaxHealth,
                            currentHealth: enemyMaxHealth,
                        };
                        return {
                            id: `enemy-${faction.id}-${index}`,
                            originalCharacter: enemyCharacter,
                            originalIndex: index,
                            icon: faction.icon,
                            isPlayer: false,
                            gridPosition: { x: enemyStartX + index, y: 1 },
                            maxHealth: enemyMaxHealth,
                            currentHealth: enemyMaxHealth,
                            damage: enemyDamage,
                            armor: 0,
                            hasTakenTurn: false,
                        };
                    });
                    
                    setCombatState({
                        playerUnits: playerCombatUnits,
                        enemyUnits: enemyCombatUnits,
                        turn: 'player',
                        round: 1,
                    });
                    setActiveCombatFactionId(faction.id);
                    setCurrentScreen('combat');
                    combatStarted = true;
                    break;
                }
            }
            if (combatStarted) return;

            const VISION_RANGE = 25;
            const PURSUIT_DURATION = 10000;

            setFactions(currentFactions => currentFactions.map(faction => {
                const newFaction = { ...faction };
                if (newFaction.defeatedUntil && now >= newFaction.defeatedUntil) {
                    const randomTemplate = POST_APOCALYPTIC_FACTIONS[Math.floor(Math.random() * POST_APOCALYPTIC_FACTIONS.length)];
                    Object.assign(newFaction, generateFaction(randomTemplate));
                    newFaction.defeatedUntil = null;
                }
                
                if (newFaction.defeatedUntil) return newFaction;

                const dxPlayer = playerPos.x - newFaction.position.x;
                const dyPlayer = playerPos.y - newFaction.position.y;
                const distanceToPlayer = Math.sqrt(dxPlayer*dxPlayer + dyPlayer*dyPlayer);
                
                if (distanceToPlayer < VISION_RANGE) {
                    if (newFaction.aiState === 'idle') {
                        // Message removed as per request
                    }
                    newFaction.aiState = 'pursuing';
                    newFaction.pursueUntil = now + PURSUIT_DURATION;
                }

                if (newFaction.aiState === 'pursuing' && newFaction.pursueUntil && now > newFaction.pursueUntil) {
                    newFaction.aiState = 'idle';
                    newFaction.pursueUntil = null;
                    const margin = 5;
                    newFaction.targetPosition = { 
                        x: Math.random() * (MAP_WIDTH - margin * 2) + margin, 
                        y: Math.random() * (MAP_HEIGHT - margin * 2) + margin 
                    };
                }

                if (newFaction.aiState === 'pursuing') {
                    newFaction.targetPosition = playerPos;
                } else {
                    const dxMove = newFaction.targetPosition.x - newFaction.position.x;
                    const dyMove = newFaction.targetPosition.y - newFaction.position.y;
                    const distanceMove = Math.sqrt(dxMove * dxMove + dyMove * dyMove);
                    const margin = 5;

                    if (distanceMove < 1) {
                        newFaction.targetPosition = { 
                            x: Math.random() * (MAP_WIDTH - margin * 2) + margin, 
                            y: Math.random() * (MAP_HEIGHT - margin * 2) + margin 
                        };
                    }
                }
                
                const finalDx = newFaction.targetPosition.x - newFaction.position.x;
                const finalDy = newFaction.targetPosition.y - newFaction.position.y;
                const finalDist = Math.sqrt(finalDx*finalDx + finalDy*finalDy);
                
                const speed = 0.9;
                if (finalDist > 0) {
                    newFaction.position.x += (finalDx / finalDist) * speed;
                    newFaction.position.y += (finalDy / finalDist) * speed;
                }
                
                return newFaction;
            }));
        }, 100);
        gameLoopIntervalRef.current = gameLoop;

        return () => clearInterval(gameLoop);
    }, [gameState]);

    const handleCombatEnd = (result: 'win' | 'lose', finalCombatState: CombatState) => {
        let xpAwarded = 0;
        let rewardItem: Item | undefined = undefined;

        if (finalCombatState) {
            const updatedCharacters = [...charactersRef.current];
            finalCombatState.playerUnits.forEach(combatUnit => {
                const originalChar = updatedCharacters[combatUnit.originalIndex];
                if (originalChar) {
                    originalChar.currentHealth = combatUnit.currentHealth > 0 ? combatUnit.currentHealth : 1;
                }
            });
            setCharacters(updatedCharacters);

            if (result === 'win') {
                addLogMessage(`Вы победили фракцию!`);
                const livingPlayerUnits = finalCombatState.playerUnits.filter(u => u.currentHealth > 0);
                if (livingPlayerUnits.length > 0) {
                    const totalXP = 1000;
                    const xpPerSurvivor = Math.floor(totalXP / livingPlayerUnits.length);
                    addLogMessage(`Отряд получает ${totalXP} XP. Выжившие бойцы получают по ${xpPerSurvivor} XP.`);
                    livingPlayerUnits.forEach(unit => {
                        handleAddXP(unit.originalIndex, xpPerSurvivor);
                    });
                    xpAwarded = totalXP;
                }
                 const randomItemTemplate = BATTLE_REWARDS_POOL[Math.floor(Math.random() * BATTLE_REWARDS_POOL.length)];
                const newItem: Item = {
                    ...randomItemTemplate,
                    stackId: crypto.randomUUID(),
                    quantity: randomItemTemplate.quantity || 1,
                };
                setInventory(prev => [...prev, newItem]);
                addLogMessage(`Вы получили предмет: ${newItem.name}!`);
                rewardItem = newItem;
            }
        }
        
        setCombatState(null);
        setCombatResult({ result, xpAwarded, rewardItem });
    };
    
    const handleAcceptQuest = (questToAccept: Quest) => {
        setQuests(prev => [...prev, questToAccept]);
        addLogMessage(`Новое задание: Принести ${questToAccept.itemName} (${questToAccept.requiredQuantity} шт.)`);
    };

    const handleCompleteQuest = (questId: string) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return;
    
        // This function removes items from inventory, handling stacks correctly.
        const removeItemFromInventory = (itemId: number, quantityToRemove: number) => {
            setInventory(currentInventory => {
                let remainingToRemove = quantityToRemove;
                const newInventory: Item[] = [];
                const itemStacks = currentInventory.filter(i => i.id === itemId).sort((a,b) => a.quantity - b.quantity);
                const otherItems = currentInventory.filter(i => i.id !== itemId);
    
                for (const stack of itemStacks) {
                    if (remainingToRemove <= 0) {
                        newInventory.push(stack);
                        continue;
                    }
    
                    if (stack.quantity > remainingToRemove) {
                        newInventory.push({ ...stack, quantity: stack.quantity - remainingToRemove });
                        remainingToRemove = 0;
                    } else {
                        remainingToRemove -= stack.quantity;
                        // The stack is fully consumed, so it's not added back.
                    }
                }
                return [...otherItems, ...newInventory];
            });
        };
    
        removeItemFromInventory(quest.itemId, quest.requiredQuantity);
        setSilver(prev => prev + quest.rewardSilver);
        setQuests(prev => prev.filter(q => q.id !== questId));
        addLogMessage(`Задание выполнено! Вы получили ${quest.rewardSilver} серебра.`);
        questCompleteMusicController.start();
    };

    const handleCompleteMainQuest = () => {
        const waterChip = inventory.find(item => item.id === 301);
        if (!waterChip) return;
    
        setInventory(prev => prev.filter(item => item.id !== 301));
        const reward = 5000;
        setSilver(prev => prev + reward);
        setMainQuestState('completed');
        
        // Remove the main quest from the quest log
        setQuests(prev => prev.filter(q => q.id !== 'main_quest_find_chip'));
        
        addLogMessage(`Главное задание выполнено! Вы спасли Оазис и получили ${reward} серебра.`);
        questCompleteMusicController.start();
    };

    const resetGame = () => {
        setInventory(generateInitialInventory());
        setCharacters(generateInitialCharacters());
        setSilver(100);
        setMerchantInventories(generateInitialMerchantInventories());
        setFactions(generateInitialFactions());
        setCharacterPosition({ x: 100, y: 100 });
        setLogMessages([]);
        setMapItems([]);
        setCombatState(null);
        setActiveCombatFactionId(null);
        setTargetItemToPickup(null);
        setIsGameActive(false);
        setCurrentCityId(null);
        setQuests([]);
        setMainQuestState('not_started');
    };

    const handleCloseCombatEndScreen = () => {
        const result = combatResult?.result;
        
        if (result === 'win') {
            setFactions(prevFactions =>
                prevFactions.map(f =>
                    f.id === activeCombatFactionId ? { ...f, defeatedUntil: Date.now() + 5 * 1000 } : f
                )
            );
        } else if (result === 'lose') {
            addLogMessage(`Ваш отряд был разбит... Игра окончена.`);
            resetGame();
            setCombatResult(null);
            setActiveCombatFactionId(null);
            setGameState('splash');
            return;
        }

        setCombatResult(null);
        setActiveCombatFactionId(null);
        setCurrentScreen('map');
    };

    const handleExitCity = () => {
        const city = CITIES.find(c => c.id === currentCityId);
        if (!city) {
            setCurrentScreen('map');
            setCurrentCityId(null);
            return;
        }
        
        const angle = Math.random() * 2 * Math.PI;
        const exitX = city.position.x + (CITY_RADIUS + 2) * Math.cos(angle);
        const exitY = city.position.y + (CITY_RADIUS + 2) * Math.sin(angle);
        
        setCharacterPosition({ x: exitX, y: exitY });
        setCurrentScreen('map');
        setCurrentCityId(null);
    };

    const handleSave = async () => {
        const saveData = {
            inventory,
            characters,
            activeCharacterIndex,
            mapItems,
            characterPosition,
            factions,
            logMessages,
            silver,
            merchantInventories,
            quests,
            mainQuestState,
        };
        
        const success = await saveGameState(saveData);

        if (success) {
            setSaveExists(true);
            addLogMessage('Игра сохранена.');
        } else {
            alert('Ошибка при сохранении игры.');
        }
    };

    const handleLoad = async () => {
        const savedData = await loadGameState();

        if (savedData) {
            try {
                if (savedData.inventory && savedData.characters && savedData.activeCharacterIndex !== undefined && savedData.mapItems && savedData.characterPosition) {
                    
                    const loadedCharacters = savedData.characters.map((c: any) => ({
                        ...c,
                        maxHealth: c.maxHealth || (12 + (c.level * 3)),
                        currentHealth: c.currentHealth || c.maxHealth || (12 + (c.level * 3)),
                    }));

                    setInventory(savedData.inventory);
                    setCharacters(loadedCharacters);
                    setActiveCharacterIndex(savedData.activeCharacterIndex);
                    setMapItems(savedData.mapItems);
                    setCharacterPosition(savedData.characterPosition);
                    setFactions(savedData.factions || generateInitialFactions());
                    setLogMessages(savedData.logMessages || []);
                    setSilver(savedData.silver || 100);
                    setMerchantInventories(savedData.merchantInventories || generateInitialMerchantInventories());
                    
                    const loadedQuests = savedData.quests || [];
                    const loadedMainQuestState = savedData.mainQuestState || 'not_started';

                    if (loadedMainQuestState === 'find_chip' && !loadedQuests.some((q: Quest) => q.id === 'main_quest_find_chip')) {
                        const mainQuest: Quest = {
                            id: 'main_quest_find_chip',
                            giverCityId: 'oasis',
                            giverName: 'Старейшина Оазиса',
                            cityName: 'Оазис',
                            itemId: 301,
                            itemName: 'Водный чип',
                            itemIcon: '💧',
                            requiredQuantity: 1,
                            rewardSilver: 5000,
                            description: 'Найдите Водный чип, утерянный в Пустошах, чтобы спасти Оазис.',
                            status: 'active',
                        };
                        loadedQuests.push(mainQuest);
                    }
                    setQuests(loadedQuests);
                    setMainQuestState(loadedMainQuestState);
                    
                    setIsGameActive(true);
                    setGameState('playing');
                    setCurrentScreen('map');
                    setShowIntroScreen(false);
                    alert('Игра загружена!');
                } else {
                    alert('Ошибка: файл сохранения поврежден.');
                }
            } catch (error) {
                console.error("Failed to parse saved data:", error);
                alert('Ошибка при загрузке: файл сохранения поврежден.');
            }
        } else {
            alert('Сохранение не найдено.');
        }
    };
    
    const handleDropItemToMap = (itemToDrop: Item) => {
        const newItemOnMap: MapItem = {
            ...itemToDrop,
            position: {
                x: Math.max(0, Math.min(MAP_WIDTH, characterPosition.x + (Math.random() - 0.5) * 2)),
                y: Math.max(0, Math.min(MAP_HEIGHT, characterPosition.y + (Math.random() - 0.5) * 2)),
            }
        };
        setMapItems(prev => [...prev, newItemOnMap]);
        addLogMessage(`Выброшен предмет: ${itemToDrop.name} (x${itemToDrop.quantity})`);
    };

    const handlePrevCharacter = () => {
      setActiveCharacterIndex(prev => (prev - 1 + characters.length) % characters.length);
    };
    
    const handleNextCharacter = () => {
      setActiveCharacterIndex(prev => (prev + 1) % characters.length);
    };

    const handleRequestRemoveCharacter = (indexToRemove: number) => {
        if (characters.length <= 1) {
            alert("Нельзя удалить последнего персонажа!");
            return;
        }
        setShowCharacteristics(false);
        setCharacterIndexToRemove(indexToRemove);
    };

    const handleConfirmRemoveCharacter = () => {
        if (characterIndexToRemove === null) return;
        const indexToRemove = characterIndexToRemove;
        const itemsToReturn: Item[] = [];
        if (characters[indexToRemove].weapon) itemsToReturn.push(characters[indexToRemove].weapon!);
        if (characters[indexToRemove].armor) itemsToReturn.push(characters[indexToRemove].armor!);
        if (itemsToReturn.length > 0) setInventory(prev => [...prev, ...itemsToReturn]);
        setCharacters(prev => prev.filter((_, index) => index !== indexToRemove));
        setActiveCharacterIndex(prev => prev >= indexToRemove ? Math.max(0, prev - 1) : prev);
        setCharacterIndexToRemove(null);
    };

    const handleCancelRemoveCharacter = () => setCharacterIndexToRemove(null);

    const activeCharacter = characters[activeCharacterIndex];

    const currentCharacterStats = useMemo<CharacterStats>(() => ({
        currentHealth: activeCharacter.currentHealth,
        maxHealth: activeCharacter.maxHealth,
        damage: 1 + (activeCharacter.weapon?.damage || 0),
        armor: activeCharacter.armor?.armor || 0,
    }), [activeCharacter]);
    
    const handleStartNewGame = () => {
        resetGame(); 
        setShowIntroScreen(true);
    };
    
    const handleEndIntro = () => {
        setShowIntroScreen(false);
        setMainQuestState('find_chip');
        
        const mainQuest: Quest = {
            id: 'main_quest_find_chip',
            giverCityId: 'oasis',
            giverName: 'Старейшина Оазиса',
            cityName: 'Оазис',
            itemId: 301,
            itemName: 'Водный чип',
            itemIcon: '💧',
            requiredQuantity: 1,
            rewardSilver: 5000,
            description: 'Найдите Водный чип, утерянный в Пустошах, чтобы спасти Оазис.',
            status: 'active',
        };
        setQuests(prev => [...prev, mainQuest]);

        setIsGameActive(true);
        setGameState('playing');
        setCurrentScreen('map');
        addLogMessage("Главное задание: Найти Водный чип для Оазиса.");
    };

    const handleContinueGame = () => {
        if (isGameActive) {
            setGameState('playing');
        }
    };

    if (showIntroScreen) {
        return <IntroScreen onEnd={handleEndIntro} />;
    }

    if (gameState === 'splash') {
        return <SplashScreen 
            onStartNewGame={handleStartNewGame} 
            onLoad={handleLoad} 
            saveExists={saveExists} 
            isGameActive={isGameActive}
            onContinueGame={handleContinueGame}
            onSave={handleSave}
        />;
    }

    if (combatResult) {
        return <CombatEndScreen 
            result={combatResult.result} 
            xpAwarded={combatResult.xpAwarded} 
            rewardItem={combatResult.rewardItem}
            onClose={handleCloseCombatEndScreen}
        />;
    }
    
    if (showQuestLog) {
        return <QuestLogScreen quests={quests} onClose={() => setShowQuestLog(false)} />;
    }

    if (currentScreen === 'combat' && combatState) {
        return <CombatScreen initialState={combatState} onCombatEnd={handleCombatEnd} />;
    }

    const currentCityData = CITIES.find(c => c.id === currentCityId);
    if (currentScreen === 'city' && currentCityData) {
        return (
            <CityScreen 
                cityData={currentCityData}
                onExit={handleExitCity}
                inventory={inventory}
                setInventory={setInventory}
                merchantInventory={merchantInventories[currentCityData.id]}
                setMerchantInventory={(updater) => {
                    setMerchantInventories(prev => {
                        const oldCityInv = prev[currentCityData.id] || [];
                        const newCityInv = typeof updater === 'function' ? updater(oldCityInv) : updater;
                        return { ...prev, [currentCityData.id]: newCityInv };
                    });
                }}
                silver={silver}
                setSilver={setSilver}
                quests={quests}
                onAcceptQuest={handleAcceptQuest}
                onCompleteQuest={handleCompleteQuest}
                mainQuestState={mainQuestState}
                onCompleteMainQuest={handleCompleteMainQuest}
            />
        );
    }

    if (currentScreen === 'inventory') {
        return <InventoryScreen inventory={inventory} setInventory={setInventory} characters={characters} setCharacters={setCharacters} activeCharacterIndex={activeCharacterIndex} setActiveCharacterIndex={setActiveCharacterIndex} onNavigateToMap={() => setCurrentScreen('map')} onDropItemToMap={handleDropItemToMap} characterCount={characters.length} silver={silver} />;
    }

    return (
        <>
            <MapScreen 
                onNavigateToInventory={() => setCurrentScreen('inventory')} 
                onShowCharacteristics={() => setShowCharacteristics(true)} 
                mapItems={mapItems} 
                onSetTargetItem={setTargetItemToPickup} 
                onCancelPickup={() => setTargetItemToPickup(null)} 
                characterPosition={characterPosition} 
                setCharacterPosition={setCharacterPosition} 
                factions={factions} 
                logMessages={logMessages} 
                onGoToMenu={() => setGameState('splash')}
                mapWidth={MAP_WIDTH}
                mapHeight={MAP_HEIGHT}
                locations={CITIES}
                onShowQuests={() => setShowQuestLog(true)}
            />
            {showCharacteristics && <CharacteristicsModal stats={currentCharacterStats} level={activeCharacter.level} xp={activeCharacter.xp} characterIndex={activeCharacterIndex} onClose={() => setShowCharacteristics(false)} onPrevCharacter={handlePrevCharacter} onNextCharacter={handleNextCharacter} onRemoveCharacter={handleRequestRemoveCharacter} onAddXP={() => handleAddXP(activeCharacterIndex, 250)} />}
            {characterIndexToRemove !== null && <CharacterRemoveConfirmation characterIndex={characterIndexToRemove} onConfirm={handleConfirmRemoveCharacter} onCancel={handleCancelRemoveCharacter} />}
        </>
    );
}

export default Game;