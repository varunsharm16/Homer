import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import CenterView from './components/CenterView';

// Mock project data
const mockProjects = [
  { id: 1, name: 'Project 1' },
  { id: 2, name: 'Project 2' },
];

// Material options (kept for reference/future use)
const materialOptions = {
  wall: [
    { name: 'Pure White', color: '#ffffff' },
    { name: 'Warm Grey', color: '#e5e5e5' },
    { name: 'Charcoal', color: '#2d2d2d' },
  ],
  floor: [
    { name: 'Oak', color: '#c19a6b' },
    { name: 'Walnut', color: '#5c4033' },
  ],
};

// Reusing the InteractiveMesh and Scene logic, simplified for the new view

function InteractiveMesh({ position, args, color, onClick, name, type }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(name, type);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, 10, -5]} intensity={0.4} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Demo Room */}
      <InteractiveMesh position={[0, 2.5, -5]} args={[10, 5, 0.2]} color="#555" /> {/* Back Wall */}
      <InteractiveMesh position={[-5, 2.5, 0]} args={[0.2, 5, 10]} color="#555" /> {/* Left Wall */}
      <InteractiveMesh position={[0, 0.75, 0]} args={[3, 1, 2]} color="#8b6f47" /> {/* Furniture */}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </>
  );
}


export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(1);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const activeProject = mockProjects.find(p => p.id === activeProjectId) || mockProjects[0];

  return (
    <div className="flex w-full h-screen bg-[#111] overflow-hidden font-sans">

      {/* Left Sidebar: Projects */}
      <LeftSidebar
        projects={mockProjects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        isOpen={leftSidebarOpen}
      />

      {/* Center: 3D View & Chat */}
      <CenterView
        projectName={activeProject.name}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
      >
        <Canvas camera={{ position: [10, 10, 10], fov: 45 }} className="bg-[#222]">
          <Scene />
        </Canvas>
      </CenterView>

      {/* Right Sidebar: Products */}
      <RightSidebar isOpen={rightSidebarOpen} />

    </div>
  );
}
