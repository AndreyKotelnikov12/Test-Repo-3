import React from 'react';

interface Location {
    name: string;
    position: { x: number; y: number };
    color: string;
}

interface MinimapProps {
    playerPos: { x: number; y: number };
    locations: Location[];
    mapWidth: number;
    mapHeight: number;
}

const MINIMAP_SIZE = 160; // in pixels

const Minimap: React.FC<MinimapProps> = ({ playerPos, locations, mapWidth, mapHeight }) => {
    return (
        <div 
            className="absolute top-4 right-4 bg-black/60 border-2 border-green-500/50 rounded-md backdrop-blur-sm shadow-lg"
            style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
        >
            {/* Render locations */}
            {locations.map(loc => (
                <div 
                    key={loc.name}
                    className="absolute rounded-full"
                    style={{
                        left: `${(loc.position.x / mapWidth) * 100}%`,
                        top: `${(loc.position.y / mapHeight) * 100}%`,
                        width: '10px',
                        height: '10px',
                        backgroundColor: loc.color,
                        transform: 'translate(-50%, -50%)',
                        border: '1px solid black',
                        boxShadow: `0 0 6px ${loc.color}`
                    }}
                    title={loc.name}
                />
            ))}
            
            {/* Render player dot */}
            <div 
                className="absolute rounded-full"
                style={{
                    left: `${(playerPos.x / mapWidth) * 100}%`,
                    top: `${(playerPos.y / mapHeight) * 100}%`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#fafafa', // White dot for player
                    transform: 'translate(-50%, -50%)',
                    border: '1px solid black',
                    boxShadow: '0 0 8px white'
                }}
                title="Вы"
            />
        </div>
    );
};

export default Minimap;