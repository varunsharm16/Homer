import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import CenterView from './components/CenterView';

// Initial project data
const initialProjects = [
  { id: 1, name: 'Project 1', floors: [1, 2] },
  { id: 2, name: 'Project 2', floors: [1] },
];

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
      <InteractiveMesh position={[0, 2.5, -5]} args={[10, 5, 0.2]} color="#555" />
      <InteractiveMesh position={[-5, 2.5, 0]} args={[0.2, 5, 10]} color="#555" />
      <InteractiveMesh position={[0, 0.75, 0]} args={[3, 1, 2]} color="#8b6f47" />

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
  const [projects, setProjects] = useState(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState(1);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Add a new project
  const handleAddProject = () => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const newProject = { id: newId, name: `Project ${newId}`, floors: [1] };
    setProjects([...projects, newProject]);
    setActiveProjectId(newId);
  };

  // Delete a project
  const handleDeleteProject = (projectId) => {
    if (projects.length <= 1) return; // Keep at least one project
    const newProjects = projects.filter(p => p.id !== projectId);
    setProjects(newProjects);
    if (activeProjectId === projectId) {
      setActiveProjectId(newProjects[0].id);
    }
  };

  // Edit project name
  const handleEditProject = (projectId, newName) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, name: newName } : p
    ));
  };

  return (
    <div className="flex w-full h-screen bg-[#111] overflow-hidden font-sans">

      {/* Left Sidebar: Projects */}
      <LeftSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
        isOpen={leftSidebarOpen}
      />

      {/* Center: 3D View & Chat */}
      <CenterView
        projectName={activeProject?.name || 'Untitled'}
        floors={activeProject?.floors || [1]}
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
