import React, { useState, useRef, useCallback, useMemo } from 'react';
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

// Threshold for detecting drag vs click (in pixels)
const DRAG_THRESHOLD = 5;

// Custom hook for drag-aware click detection
function useDragAwareClick(onSelect, name) {
  const pointerDownPos = useRef(null);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e) => {
    e.stopPropagation();
    if (pointerDownPos.current) {
      const dx = Math.abs(e.clientX - pointerDownPos.current.x);
      const dy = Math.abs(e.clientY - pointerDownPos.current.y);
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
        onSelect(name);
      }
    }
    pointerDownPos.current = null;
  }, [onSelect, name]);

  const handlePointerOut = useCallback(() => {
    pointerDownPos.current = null;
  }, []);

  return { handlePointerDown, handlePointerUp, handlePointerOut };
}

// Selectable surface component
function SelectableSurface({ position, args, color, name, isSelected, onSelect, rotation }) {
  const [hovered, setHovered] = useState(false);
  const { handlePointerDown, handlePointerUp, handlePointerOut } = useDragAwareClick(onSelect, name);

  const { baseColor, emissiveColor, emissiveIntensity } = useMemo(() => ({
    baseColor: isSelected ? '#4a9eff' : color,
    emissiveColor: isSelected ? '#4a9eff' : (hovered ? color : '#000000'),
    emissiveIntensity: isSelected ? 0.4 : (hovered ? 0.2 : 0)
  }), [isSelected, color, hovered]);

  return (
    <mesh
      position={position}
      rotation={rotation}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
        handlePointerOut();
      }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={baseColor}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

// Selectable floor component
function SelectableFloor({ color, name, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const { handlePointerDown, handlePointerUp, handlePointerOut } = useDragAwareClick(onSelect, name);

  const { baseColor, emissiveColor, emissiveIntensity } = useMemo(() => ({
    baseColor: isSelected ? '#4a9eff' : color,
    emissiveColor: isSelected ? '#4a9eff' : (hovered ? color : '#000000'),
    emissiveIntensity: isSelected ? 0.3 : (hovered ? 0.15 : 0)
  }), [isSelected, color, hovered]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
        handlePointerOut();
      }}
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

function Scene({ selectedSurfaces, onSelectSurface }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, 10, -5]} intensity={0.4} />

      {/* Floor */}
      <SelectableFloor
        color="#333"
        name="floor1"
        isSelected={selectedSurfaces.includes('floor1')}
        onSelect={onSelectSurface}
      />

      {/* Walls */}
      <SelectableSurface
        position={[0, 2.5, -5]}
        args={[10, 5, 0.2]}
        color="#555"
        name="wall1"
        isSelected={selectedSurfaces.includes('wall1')}
        onSelect={onSelectSurface}
      />
      <SelectableSurface
        position={[-5, 2.5, 0]}
        args={[0.2, 5, 10]}
        color="#555"
        name="wall2"
        isSelected={selectedSurfaces.includes('wall2')}
        onSelect={onSelectSurface}
      />
      <SelectableSurface
        position={[5, 2.5, 0]}
        args={[0.2, 5, 10]}
        color="#555"
        name="wall3"
        isSelected={selectedSurfaces.includes('wall3')}
        onSelect={onSelectSurface}
      />
      <SelectableSurface
        position={[0, 2.5, 5]}
        args={[10, 5, 0.2]}
        color="#555"
        name="wall4"
        isSelected={selectedSurfaces.includes('wall4')}
        onSelect={onSelectSurface}
      />

      {/* Furniture */}
      <SelectableSurface
        position={[0, 0.75, 0]}
        args={[3, 1, 2]}
        color="#8b6f47"
        name="table1"
        isSelected={selectedSurfaces.includes('table1')}
        onSelect={onSelectSurface}
      />

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
  const [selectedSurfaces, setSelectedSurfaces] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  const activeProject = useMemo(() =>
    projects.find(p => p.id === activeProjectId) || projects[0],
    [projects, activeProjectId]
  );

  // Toggle surface selection (multi-select support)
  const handleSelectSurface = useCallback((surfaceName) => {
    setSelectedSurfaces(prev =>
      prev.includes(surfaceName)
        ? prev.filter(s => s !== surfaceName)
        : [...prev, surfaceName]
    );
  }, []);

  // Remove a selected surface
  const handleRemoveSurface = useCallback((surfaceName) => {
    setSelectedSurfaces(prev => prev.filter(s => s !== surfaceName));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((imageData) => {
    setUploadedImages(prev => [...prev, imageData]);
  }, []);

  // Remove an uploaded image
  const handleRemoveImage = useCallback((index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Add a new project
  const handleAddProject = useCallback(() => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const newProject = { id: newId, name: `Project ${newId}`, floors: [1] };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newId);
  }, [projects]);

  // Delete a project
  const handleDeleteProject = useCallback((projectId) => {
    if (projects.length <= 1) return;
    setProjects(prev => {
      const newProjects = prev.filter(p => p.id !== projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(newProjects[0].id);
      }
      return newProjects;
    });
  }, [projects.length, activeProjectId]);

  // Edit project name
  const handleEditProject = useCallback((projectId, newName) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, name: newName } : p
    ));
  }, []);

  // Toggle handlers
  const toggleLeftSidebar = useCallback(() => setLeftSidebarOpen(prev => !prev), []);
  const toggleRightSidebar = useCallback(() => setRightSidebarOpen(prev => !prev), []);

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
        onToggleLeftSidebar={toggleLeftSidebar}
        onToggleRightSidebar={toggleRightSidebar}
        selectedSurfaces={selectedSurfaces}
        onRemoveSurface={handleRemoveSurface}
        uploadedImages={uploadedImages}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
      >
        <Canvas camera={{ position: [10, 10, 10], fov: 45 }} className="bg-[#222]">
          <Scene
            selectedSurfaces={selectedSurfaces}
            onSelectSurface={handleSelectSurface}
          />
        </Canvas>
      </CenterView>

      {/* Right Sidebar: Products */}
      <RightSidebar isOpen={rightSidebarOpen} />
    </div>
  );
}
