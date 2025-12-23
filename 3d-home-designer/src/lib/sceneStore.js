import { create } from 'zustand';

/**
 * Scene DSL Store
 * 
 * Manages the 3D scene state with support for:
 * - Loading scenes from AI-generated DSL
 * - Preview mode for showing changes before commit
 * - Individual element operations
 * 
 * @security Note: This store only handles data structures.
 * All AI API calls happen in serverless functions.
 */

// Default empty scene
const emptyScene = {
    version: '1.0',
    rooms: [],
    walls: [],
    openings: [],
    objects: [],
    materials: {}
};

export const useSceneStore = create((set, get) => ({
    // Current committed scene
    scene: { ...emptyScene },

    // Preview scene (shown as ghost/transparent)
    previewScene: null,

    // Loading states
    isLoading: false,
    loadingMessage: '',

    // Error state
    error: null,

    // ============ Scene Loading ============

    /**
     * Load a complete scene from DSL (replaces current scene)
     */
    loadScene: (dsl) => set({
        scene: { ...emptyScene, ...dsl },
        previewScene: null,
        error: null
    }),

    /**
     * Clear the scene back to empty
     */
    clearScene: () => set({
        scene: { ...emptyScene },
        previewScene: null,
        error: null
    }),

    // ============ Preview System ============

    /**
     * Show a preview of proposed changes (ghost mode)
     */
    setPreview: (dsl) => set({ previewScene: dsl }),

    /**
     * Commit the preview to the actual scene
     */
    commitPreview: () => {
        const { previewScene } = get();
        if (previewScene) {
            set({
                scene: previewScene,
                previewScene: null
            });
        }
    },

    /**
     * Discard the preview
     */
    cancelPreview: () => set({ previewScene: null }),

    // ============ Individual Operations ============

    /**
     * Add a room to the scene
     */
    addRoom: (room) => set((state) => ({
        scene: {
            ...state.scene,
            rooms: [...state.scene.rooms, { id: `room_${Date.now()}`, ...room }]
        }
    })),

    /**
     * Add a wall to the scene
     */
    addWall: (wall) => set((state) => ({
        scene: {
            ...state.scene,
            walls: [...state.scene.walls, { id: `wall_${Date.now()}`, ...wall }]
        }
    })),

    /**
     * Add an object (furniture) to the scene
     */
    addObject: (obj) => set((state) => ({
        scene: {
            ...state.scene,
            objects: [...state.scene.objects, { id: `obj_${Date.now()}`, ...obj }]
        }
    })),

    /**
     * Remove an object by ID
     */
    removeObject: (objectId) => set((state) => ({
        scene: {
            ...state.scene,
            objects: state.scene.objects.filter(o => o.id !== objectId)
        }
    })),

    /**
     * Update material for a surface
     */
    updateMaterial: (surfaceId, material) => set((state) => ({
        scene: {
            ...state.scene,
            materials: {
                ...state.scene.materials,
                [surfaceId]: material
            }
        }
    })),

    // ============ Loading State ============

    setLoading: (isLoading, message = '') => set({
        isLoading,
        loadingMessage: message
    }),

    setError: (error) => set({ error }),
    clearError: () => set({ error: null })
}));

// Selector hooks for performance
export const useScene = () => useSceneStore((state) => state.scene);
export const usePreview = () => useSceneStore((state) => state.previewScene);
export const useSceneLoading = () => useSceneStore((state) => ({
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage
}));
