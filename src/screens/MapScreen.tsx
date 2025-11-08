import React, { useState, useRef, useEffect } from 'react';
import { MapItem, Faction, Quest } from '../types';
import EventLog from '../components/EventLog';
import Minimap from '../components/Minimap';
import QuestLogScreen from '../components/QuestLogScreen';

interface Location {
    id: string;
    name: string;
    position: { x: number; y: number };
    color: string;
}

interface MapScreenProps {
    onNavigateToInventory: () => void;
    onShowCharacteristics: () => void;
    onGoToMenu: () => void;
    mapItems: MapItem[];
    onSetTargetItem: (item: MapItem) => void;
    onCancelPickup: () => void;
    characterPosition: { x: number; y: number };
    setCharacterPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    factions: Faction[];
    logMessages: string[];
    mapWidth: number;
    mapHeight: number;
    locations: Location[];
    onShowQuests: () => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ 
    onNavigateToInventory, 
    onShowCharacteristics, 
    onGoToMenu,
    mapItems, 
    onSetTargetItem,
    onCancelPickup,
    characterPosition, 
    setCharacterPosition, 
    factions, 
    logMessages,
    mapWidth,
    mapHeight,
    locations,
    onShowQuests,
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [targetPosition, setTargetPosition] = useState(characterPosition);
    const characterPositionRef = useRef(characterPosition);
    characterPositionRef.current = characterPosition;
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 250);
        return () => clearInterval(timer);
    }, []);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mapRef.current) return;

        const rect = mapRef.current.getBoundingClientRect();
        
        const clickX_vw = e.clientX - rect.width / 2;
        const clickY_vh = e.clientY - rect.height / 2;

        // Convert viewport pixels to world units. Assuming viewport shows roughly 100 world units across.
        const worldX = characterPosition.x + (clickX_vw / rect.width) * 100;
        const worldY = characterPosition.y + (clickY_vh / rect.height) * 100;

        const clampedX = Math.max(0, Math.min(mapWidth, worldX));
        const clampedY = Math.max(0, Math.min(mapHeight, worldY));

        setTargetPosition({ x: clampedX, y: clampedY });
        onCancelPickup();
    };

    useEffect(() => {
        let animationFrameId: number;

        const move = () => {
            const currentPos = characterPositionRef.current;
            const dx = targetPosition.x - currentPos.x;
            const dy = targetPosition.y - currentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 0.5) {
                cancelAnimationFrame(animationFrameId);
                return;
            }

            const speed = 0.3;
            let newX = currentPos.x + (dx / distance) * speed;
            let newY = currentPos.y + (dy / distance) * speed;
            
            newX = Math.max(0, Math.min(mapWidth, newX));
            newY = Math.max(0, Math.min(mapHeight, newY));

            setCharacterPosition({ x: newX, y: newY });

            animationFrameId = requestAnimationFrame(move);
        };

        animationFrameId = requestAnimationFrame(move);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [targetPosition, setCharacterPosition, mapWidth, mapHeight]);

    const scaleX = 100 / mapWidth;
    const scaleY = 100 / mapHeight;

    return (
        <div 
            ref={mapRef}
            className="relative w-screen h-screen bg-[#0a1a0a] overflow-hidden cursor-pointer"
            onClick={handleMapClick}
        >
            {/* Background (static) */}
            <div 
                className="absolute inset-0" 
                style={{ 
                    background: 'radial-gradient(ellipse at center, rgba(18, 55, 18, 0.8) 0%, #0a1a0a 70%)',
                    backgroundImage: `
                        radial-gradient(ellipse at center, rgba(18, 55, 18, 0.8) 0%, #0a1a0a 70%),
                        repeating-linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 1px, transparent 1px, transparent 2px)
                    `,
                }}
            />
            <div className="absolute inset-0 bg-black/10"></div>

            {/* World Container (moves based on player position) */}
            <div
                className="absolute top-0 left-0 transition-transform duration-100 ease-linear"
                style={{
                    width: `${mapWidth}%`,
                    height: `${mapHeight}%`,
                    transform: `translate(calc(50vw - ${characterPosition.x * scaleX}%), calc(50vh - ${characterPosition.y * scaleY}%))`,
                }}
            >
                {/* City Locations */}
                {locations.map(city => (
                    <div
                        key={city.id}
                        className="absolute"
                        style={{
                            top: `${(city.position.y / mapHeight) * 100}%`,
                            left: `${(city.position.x / mapWidth) * 100}%`,
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="relative transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-16 h-16 rounded-full border-4" style={{ borderColor: city.color, backgroundColor: `${city.color}33`}}>
                            </div>
                            <div className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-semibold" style={{color: city.color, textShadow: '1px 1px 3px #000'}}>
                                {city.name}
                            </div>
                        </div>
                    </div>
                ))}

                {mapItems.map((item) => {
                    const hasExpiry = !!item.expiresAt;
                    let pulseDuration = '2s';
                    let animationClass = '';
                    if (hasExpiry) {
                        const remaining = item.expiresAt! - currentTime;
                        if (remaining > 0) {
                            pulseDuration = `${Math.max(0.25, (remaining / 10000) * 1.5)}s`;
                            animationClass = 'item-pulse';
                        }
                    }
                    const baseFilter = 'drop-shadow(0 0 5px rgba(50, 255, 126, 0.5))';

                    return (
                        <div
                            key={item.stackId}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl hover:scale-125 transition-transform duration-200 ${animationClass}`}
                            style={{ 
                                top: `${(item.position.y / mapHeight) * 100}%`,
                                left: `${(item.position.x / mapWidth) * 100}%`,
                                cursor: 'cell',
                                filter: hasExpiry ? undefined : baseFilter,
                                // @ts-ignore
                                '--pulse-duration': pulseDuration,
                             }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTargetPosition(item.position);
                                onSetTargetItem(item);
                            }}
                            title={`Подобрать: ${item.name}`}
                        >
                            {item.icon}
                        </div>
                    );
                })}

                {factions.filter(f => !f.defeatedUntil).map((faction) => (
                    <div
                        key={faction.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl transition-all duration-100"
                        style={{
                            top: `${(faction.position.y / mapHeight) * 100}%`,
                            left: `${(faction.position.x / mapWidth) * 100}%`,
                            pointerEvents: 'none',
                        }}
                        title={`${faction.name} (Отряды: ${faction.characters.length})`}
                    >
                        <div className="relative" style={{ filter: `drop-shadow(0 0 8px ${faction.color})` }}>
                            {faction.icon}
                            {faction.aiState === 'pursuing' && (
                                <span className="absolute -top-3 -right-3 text-2xl text-red-500 animate-pulse" style={{filter: 'drop-shadow(0 0 3px #000)'}}>
                                    !
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Player Character (fixed in center) */}
            <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl"
                style={{
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 0 8px rgba(50, 255, 126, 0.9))'
                }}
            >
                 🚶
            </div>

            {/* UI Overlay (fixed) */}
            <Minimap 
                playerPos={characterPosition} 
                locations={locations} 
                mapWidth={mapWidth} 
                mapHeight={mapHeight} 
            />

            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm cursor-default border-t-2 border-green-500/30" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center gap-4">
                    <EventLog messages={logMessages} />
                    <div className="grid grid-cols-2 gap-1.5 flex-shrink-0 w-48">
                         <button 
                            className="px-3 py-1.5 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-xs font-semibold hover:bg-green-900/70 transition-colors font-mono"
                            onClick={onGoToMenu}
                        >
                            Меню
                        </button>
                         <button 
                            className="px-3 py-1.5 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-xs font-semibold hover:bg-green-900/70 transition-colors font-mono"
                            onClick={onNavigateToInventory}
                        >
                            Инвентарь
                        </button>
                        <button 
                            className="px-3 py-1.5 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-xs font-semibold hover:bg-green-900/70 transition-colors font-mono"
                            onClick={onShowCharacteristics}
                        >
                            Герои
                        </button>
                         <button 
                            className="px-3 py-1.5 bg-[#1a2b1a] border border-green-500/70 text-green-300 rounded-md text-xs font-semibold hover:bg-green-900/70 transition-colors font-mono"
                            onClick={onShowQuests}
                        >
                            Квесты
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapScreen;