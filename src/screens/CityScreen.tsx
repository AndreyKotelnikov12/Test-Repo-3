import React, { useState, useRef, useEffect } from 'react';
import { Item, Quest, MainQuestState } from '../types';
import TradeScreen from './TradeScreen';
import DialogueScreen from './DialogueScreen';
import ElderDialogueScreen from './ElderDialogueScreen';

interface CityData {
    id: string;
    name: string;
    merchantName: string;
}

interface CityScreenProps {
    cityData: CityData;
    onExit: () => void;
    inventory: Item[];
    setInventory: React.Dispatch<React.SetStateAction<Item[]>>;
    merchantInventory: Item[];
    setMerchantInventory: React.Dispatch<React.SetStateAction<Item[]>>;
    silver: number;
    setSilver: React.Dispatch<React.SetStateAction<number>>;
    quests: Quest[];
    onAcceptQuest: (quest: Quest) => void;
    onCompleteQuest: (questId: string) => void;
    mainQuestState: MainQuestState;
    onCompleteMainQuest: () => void;
}

const MERCHANT_BUILDING_RECT = { x: 45, y: 15, width: 10, height: 20 };
const ELDER_BUILDING_RECT = { x: 45, y: 65, width: 10, height: 20 };
const EXIT_RECT = { x: 90, y: 0, width: 10, height: 100 };
const START_POSITION = { x: 5, y: 50 };

const CityScreen: React.FC<CityScreenProps> = ({ 
    cityData,
    onExit,
    inventory,
    setInventory,
    merchantInventory,
    setMerchantInventory,
    silver,
    setSilver,
    quests,
    onAcceptQuest,
    onCompleteQuest,
    mainQuestState,
    onCompleteMainQuest,
}) => {
    const cityMapRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState(START_POSITION); 
    const [target, setTarget] = useState(START_POSITION);
    const positionRef = useRef(position);
    positionRef.current = position;

    const [interactingWith, setInteractingWith] = useState<'none' | 'merchant' | 'elder'>('none');
    const [showTradeScreen, setShowTradeScreen] = useState(false);
    const isInsideBuildingRef = useRef<'none' | 'merchant' | 'elder'>('none');

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cityMapRef.current || interactingWith !== 'none' || showTradeScreen) return;
        const rect = cityMapRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTarget({ x, y });
    };

    const handleLeaveInteraction = () => {
        setInteractingWith('none');
        setShowTradeScreen(false);

        let newY;
        if(isInsideBuildingRef.current === 'merchant') {
            newY = MERCHANT_BUILDING_RECT.y + MERCHANT_BUILDING_RECT.height + 2;
        } else if (isInsideBuildingRef.current === 'elder') {
            newY = ELDER_BUILDING_RECT.y + ELDER_BUILDING_RECT.height + 2;
        } else {
            newY = position.y;
        }

        const newPos = { x: position.x, y: newY };
        setPosition(newPos);
        setTarget(newPos);
    };
    
    const handleStartTrade = () => {
        setInteractingWith('none');
        setShowTradeScreen(true);
    };
    
    const handleReturnToDialogue = () => {
        setShowTradeScreen(false);
        setInteractingWith('merchant');
    };

    useEffect(() => {
        if (interactingWith !== 'none' || showTradeScreen) return;
        let animationFrameId: number;

        const move = () => {
            const currentPos = positionRef.current;
            const dx = target.x - currentPos.x;
            const dy = target.y - currentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 0.5) {
                cancelAnimationFrame(animationFrameId);
                return;
            }

            const speed = 0.3;
            let newX = currentPos.x + (dx / distance) * speed;
            let newY = currentPos.y + (dy / distance) * speed;
            
            const isInMerchantBuilding = newX > MERCHANT_BUILDING_RECT.x && newX < MERCHANT_BUILDING_RECT.x + MERCHANT_BUILDING_RECT.width && newY > MERCHANT_BUILDING_RECT.y && newY < MERCHANT_BUILDING_RECT.y + MERCHANT_BUILDING_RECT.height;
            const isInElderBuilding = cityData.id === 'oasis' && newX > ELDER_BUILDING_RECT.x && newX < ELDER_BUILDING_RECT.x + ELDER_BUILDING_RECT.width && newY > ELDER_BUILDING_RECT.y && newY < ELDER_BUILDING_RECT.y + ELDER_BUILDING_RECT.height;

            if (isInMerchantBuilding && isInsideBuildingRef.current !== 'merchant') {
                isInsideBuildingRef.current = 'merchant';
                setInteractingWith('merchant');
                setTarget(currentPos);
                cancelAnimationFrame(animationFrameId);
                return;
            } else if (isInElderBuilding && isInsideBuildingRef.current !== 'elder') {
                 isInsideBuildingRef.current = 'elder';
                 setInteractingWith('elder');
                 setTarget(currentPos);
                 cancelAnimationFrame(animationFrameId);
                 return;
            } else if (!isInMerchantBuilding && !isInElderBuilding) {
                isInsideBuildingRef.current = 'none';
            }
            
            if (newX > EXIT_RECT.x) {
                onExit();
                cancelAnimationFrame(animationFrameId);
                return;
            }
            
            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            setPosition({ x: newX, y: newY });
            animationFrameId = requestAnimationFrame(move);
        };

        animationFrameId = requestAnimationFrame(move);
        return () => cancelAnimationFrame(animationFrameId);
    }, [target, onExit, showTradeScreen, interactingWith, cityData.id]);
    
    return (
        <>
        <div 
            ref={cityMapRef}
            className="relative w-screen h-screen bg-[#0a1a0a] overflow-hidden cursor-pointer font-mono"
            onClick={handleMapClick}
        >
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
            
            <h1 className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-bold text-green-400/80 tracking-widest" style={{textShadow: '2px 2px 4px #000'}}>
                {cityData.name.toUpperCase()}
            </h1>
            
            {/* Merchant Building */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-black/50 border-4 border-green-700 rounded-lg flex items-center justify-center"
                style={{
                    left: `${MERCHANT_BUILDING_RECT.x + MERCHANT_BUILDING_RECT.width / 2}%`,
                    top: `${MERCHANT_BUILDING_RECT.y + MERCHANT_BUILDING_RECT.height / 2}%`,
                    width: `${MERCHANT_BUILDING_RECT.width}%`,
                    height: `${MERCHANT_BUILDING_RECT.height}%`,
                    pointerEvents: 'none',
                }}
            >
                <span className="text-5xl" title="Торговец">🏪</span>
            </div>

            {/* Elder Building (Oasis only) */}
            {cityData.id === 'oasis' && (
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-black/50 border-4 border-sky-700 rounded-lg flex items-center justify-center"
                    style={{
                        left: `${ELDER_BUILDING_RECT.x + ELDER_BUILDING_RECT.width / 2}%`,
                        top: `${ELDER_BUILDING_RECT.y + ELDER_BUILDING_RECT.height / 2}%`,
                        width: `${ELDER_BUILDING_RECT.width}%`,
                        height: `${ELDER_BUILDING_RECT.height}%`,
                        pointerEvents: 'none',
                    }}
                >
                    <span className="text-5xl" title="Старейшина">🏛️</span>
                </div>
            )}


            {/* Exit Zone */}
            <div
                className="absolute"
                style={{
                    left: `${EXIT_RECT.x}%`,
                    top: `${EXIT_RECT.y}%`,
                    width: `${EXIT_RECT.width}%`,
                    height: `${EXIT_RECT.height}%`,
                    pointerEvents: 'none',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-l from-green-900/40 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                    <div className="text-6xl text-green-300 animate-pulse">➡️</div>
                    <div className="text-green-300 font-bold text-lg md:text-xl tracking-widest [writing-mode:vertical-rl] opacity-70">
                        ВЫХОД
                    </div>
                </div>
            </div>

            {/* Player Character */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl"
                style={{
                    top: `${position.y}%`,
                    left: `${position.x}%`,
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 0 8px rgba(50, 255, 126, 0.9))'
                }}
            >
                 🚶
            </div>
        </div>
        {interactingWith === 'merchant' && (
            <DialogueScreen
                merchantName={cityData.merchantName}
                cityId={cityData.id}
                cityName={cityData.name}
                onTrade={handleStartTrade}
                onExit={handleLeaveInteraction}
                quests={quests}
                playerInventory={inventory}
                onAcceptQuest={onAcceptQuest}
                onCompleteQuest={onCompleteQuest}
            />
        )}
        {interactingWith === 'elder' && cityData.id === 'oasis' && (
            <ElderDialogueScreen
                onExit={handleLeaveInteraction}
                inventory={inventory}
                mainQuestState={mainQuestState}
                onCompleteMainQuest={onCompleteMainQuest}
            />
        )}
        {showTradeScreen && (
            <TradeScreen
                merchantName={cityData.merchantName}
                onExit={handleReturnToDialogue}
                playerInventory={inventory}
                setPlayerInventory={setInventory}
                merchantInventory={merchantInventory}
                setMerchantInventory={setMerchantInventory}
                silver={silver}
                setSilver={setSilver}
            />
        )}
        </>
    );
};

export default CityScreen;