/**
 * Furniture Library
 * 
 * Procedural 3D furniture components for the home designer.
 * These are built with Three.js primitives for fast loading.
 * 
 * Each furniture piece is a React component that can be placed in the scene.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

// Shared materials
const woodMaterial = { color: '#8B4513', roughness: 0.8 };
const fabricMaterial = { color: '#4A5568', roughness: 0.9 };
const metalMaterial = { color: '#718096', metalness: 0.8, roughness: 0.2 };

// ============ SEATING ============

export function Sofa({ position = [0, 0, 0], rotation = 0, color = '#4A5568' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Base/seat */}
            <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[2.4, 0.3, 0.9]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.55, -0.35]}>
                <boxGeometry args={[2.4, 0.5, 0.2]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Left arm */}
            <mesh position={[-1.1, 0.4, 0]}>
                <boxGeometry args={[0.2, 0.4, 0.9]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Right arm */}
            <mesh position={[1.1, 0.4, 0]}>
                <boxGeometry args={[0.2, 0.4, 0.9]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Legs */}
            {[[-1, -0.3], [1, -0.3], [-1, 0.3], [1, 0.3]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.05, z]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
                    <meshStandardMaterial {...metalMaterial} />
                </mesh>
            ))}
        </group>
    );
}

export function Armchair({ position = [0, 0, 0], rotation = 0, color = '#4A5568' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Seat */}
            <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[0.8, 0.2, 0.7]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.55, -0.3]}>
                <boxGeometry args={[0.8, 0.5, 0.15]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Arms */}
            <mesh position={[-0.35, 0.35, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.6]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            <mesh position={[0.35, 0.35, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.6]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Legs */}
            {[[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.08, z]}>
                    <boxGeometry args={[0.06, 0.16, 0.06]} />
                    <meshStandardMaterial {...woodMaterial} />
                </mesh>
            ))}
        </group>
    );
}

export function DiningChair({ position = [0, 0, 0], rotation = 0, color = '#8B4513' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Seat */}
            <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[0.45, 0.05, 0.45]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.8, -0.2]}>
                <boxGeometry args={[0.4, 0.6, 0.05]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Legs */}
            {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.22, z]}>
                    <boxGeometry args={[0.04, 0.44, 0.04]} />
                    <meshStandardMaterial color={color} roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}

// ============ TABLES ============

export function CoffeeTable({ position = [0, 0, 0], rotation = 0, color = '#8B4513' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Top */}
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[1.2, 0.05, 0.6]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Legs */}
            {[[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.2, z]}>
                    <boxGeometry args={[0.05, 0.38, 0.05]} />
                    <meshStandardMaterial {...metalMaterial} />
                </mesh>
            ))}
        </group>
    );
}

export function DiningTable({ position = [0, 0, 0], rotation = 0, color = '#8B4513' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Top */}
            <mesh position={[0, 0.75, 0]}>
                <boxGeometry args={[1.8, 0.06, 0.9]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Legs */}
            {[[-0.8, -0.35], [0.8, -0.35], [-0.8, 0.35], [0.8, 0.35]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.36, z]}>
                    <boxGeometry args={[0.08, 0.72, 0.08]} />
                    <meshStandardMaterial color={color} roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}

export function Desk({ position = [0, 0, 0], rotation = 0, color = '#D4A574' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Top */}
            <mesh position={[0, 0.75, 0]}>
                <boxGeometry args={[1.4, 0.04, 0.7]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            {/* Left panel */}
            <mesh position={[-0.65, 0.37, 0]}>
                <boxGeometry args={[0.04, 0.72, 0.65]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Right drawers */}
            <mesh position={[0.55, 0.37, 0]}>
                <boxGeometry args={[0.5, 0.72, 0.65]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
        </group>
    );
}

// ============ STORAGE ============

export function Bookshelf({ position = [0, 0, 0], rotation = 0, color = '#8B4513' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Back panel */}
            <mesh position={[0, 1, -0.14]}>
                <boxGeometry args={[1, 2, 0.02]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Sides */}
            <mesh position={[-0.48, 1, 0]}>
                <boxGeometry args={[0.04, 2, 0.3]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            <mesh position={[0.48, 1, 0]}>
                <boxGeometry args={[0.04, 2, 0.3]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Shelves */}
            {[0.02, 0.5, 1, 1.5, 1.98].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <boxGeometry args={[0.92, 0.04, 0.28]} />
                    <meshStandardMaterial color={color} roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}

export function Cabinet({ position = [0, 0, 0], rotation = 0, color = '#FFFFFF' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Main body */}
            <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[0.8, 0.9, 0.4]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Door line (visual) */}
            <mesh position={[0, 0.45, 0.201]}>
                <boxGeometry args={[0.02, 0.85, 0.01]} />
                <meshStandardMaterial color="#888" roughness={0.5} />
            </mesh>
            {/* Handles */}
            <mesh position={[-0.08, 0.45, 0.21]}>
                <boxGeometry args={[0.02, 0.1, 0.02]} />
                <meshStandardMaterial {...metalMaterial} />
            </mesh>
            <mesh position={[0.08, 0.45, 0.21]}>
                <boxGeometry args={[0.02, 0.1, 0.02]} />
                <meshStandardMaterial {...metalMaterial} />
            </mesh>
        </group>
    );
}

// ============ BEDS ============

export function QueenBed({ position = [0, 0, 0], rotation = 0, color = '#E8E8E8' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Frame */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1.6, 0.2, 2.1]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[1.5, 0.25, 2]} />
                <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
            {/* Headboard */}
            <mesh position={[0, 0.7, -1]}>
                <boxGeometry args={[1.6, 0.8, 0.1]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>
            {/* Pillows */}
            <mesh position={[-0.4, 0.6, -0.75]}>
                <boxGeometry args={[0.5, 0.15, 0.35]} />
                <meshStandardMaterial color="#FFF" roughness={0.95} />
            </mesh>
            <mesh position={[0.4, 0.6, -0.75]}>
                <boxGeometry args={[0.5, 0.15, 0.35]} />
                <meshStandardMaterial color="#FFF" roughness={0.95} />
            </mesh>
        </group>
    );
}

export function SingleBed({ position = [0, 0, 0], rotation = 0, color = '#E8E8E8' }) {
    const rot = useMemo(() => [0, (rotation * Math.PI) / 180, 0], [rotation]);

    return (
        <group position={position} rotation={rot}>
            {/* Frame */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1, 0.2, 2]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.9, 0.25, 1.9]} />
                <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
            {/* Headboard */}
            <mesh position={[0, 0.65, -0.95]}>
                <boxGeometry args={[1, 0.7, 0.08]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>
            {/* Pillow */}
            <mesh position={[0, 0.6, -0.7]}>
                <boxGeometry args={[0.5, 0.12, 0.3]} />
                <meshStandardMaterial color="#FFF" roughness={0.95} />
            </mesh>
        </group>
    );
}

// ============ FURNITURE REGISTRY ============

/**
 * Map of furniture types to their components
 */
export const FurnitureRegistry = {
    sofa: Sofa,
    armchair: Armchair,
    dining_chair: DiningChair,
    coffee_table: CoffeeTable,
    dining_table: DiningTable,
    desk: Desk,
    bookshelf: Bookshelf,
    cabinet: Cabinet,
    queen_bed: QueenBed,
    single_bed: SingleBed
};

/**
 * Render furniture from scene object data
 */
export function FurnitureObject({ type, position, rotation = 0, color }) {
    const Component = FurnitureRegistry[type];

    if (!Component) {
        console.warn(`Unknown furniture type: ${type}`);
        return null;
    }

    return <Component position={position} rotation={rotation} color={color} />;
}

/**
 * Get list of available furniture types
 */
export function getAvailableFurniture() {
    return Object.keys(FurnitureRegistry).map(key => ({
        id: key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }));
}
