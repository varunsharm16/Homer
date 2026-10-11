import { create } from "zustand";
import { persist } from "zustand/middleware";

const id = () => crypto.randomUUID();
let storageFull = false;
export const makeFloor = (name = "Ground floor", furnished = false) => ({
  id: id(),
  name,
  plan: null,
  width: 12,
  depth: 9,
  height: 2.8,
  walls: [
    {
      id: "back",
      name: "North wall",
      from: [-6, -4.5],
      to: [6, -4.5],
      height: 2.8,
      thickness: 0.16,
    },
    {
      id: "left",
      name: "West wall",
      from: [-6, -4.5],
      to: [-6, 4.5],
      height: 2.8,
      thickness: 0.16,
    },
    {
      id: "partition",
      name: "Bedroom wall",
      from: [1.6, -4.5],
      to: [1.6, -0.5],
      height: 2.8,
      thickness: 0.14,
    },
    {
      id: "bedroom",
      name: "Bedroom entry",
      from: [1.6, -0.5],
      to: [4.5, -0.5],
      height: 2.8,
      thickness: 0.14,
    },
  ],
  rooms: [
    {
      id: "floor",
      name: "Oak floor",
      bounds: [
        [-6, -4.5],
        [6, 4.5],
      ],
    },
  ],
  materials: { floor: { color: "#c5ab8b", type: "wood" } },
  objects: furnished
    ? [
        {
          id: id(),
          name: "Linen sofa",
          type: "sofa",
          position: [-2.6, 0, -0.9],
          rotation: 0,
          scale: [1.45, 1.45, 1.45],
          color: "#e1d4bd",
        },
        {
          id: id(),
          name: "Oak coffee table",
          type: "coffee_table",
          position: [-2.6, 0, 1],
          rotation: 0,
          scale: [1.35, 1.2, 1.35],
          color: "#6e4e37",
        },
        {
          id: id(),
          name: "Lounge chair",
          type: "armchair",
          position: [-4.65, 0, 1.8],
          rotation: 35,
          scale: [1.2, 1.2, 1.2],
          color: "#9e7454",
        },
        {
          id: id(),
          name: "Dining table",
          type: "dining_table",
          position: [2.7, 0, 2.35],
          rotation: 0,
          scale: [1.3, 1.3, 1.3],
          color: "#a8835e",
        },
        ...[
          [1.7, 1.35, 0],
          [3.7, 1.35, 0],
          [1.7, 3.35, 180],
          [3.7, 3.35, 180],
        ].map(([x, z, r]) => ({
          id: id(),
          name: "Dining chair",
          type: "dining_chair",
          position: [x, 0, z],
          rotation: r,
          scale: [1, 1, 1],
          color: "#ac8961",
        })),
        {
          id: id(),
          name: "Soft bed",
          type: "queen_bed",
          position: [3.7, 0, -2.7],
          rotation: 0,
          scale: [1.15, 1.15, 1.15],
          color: "#f2e9dd",
        },
        {
          id: id(),
          name: "Olive tree",
          type: "plant",
          position: [-5.25, 0, -3.65],
          rotation: 0,
          scale: [1, 1, 1],
          color: "#566044",
        },
        {
          id: id(),
          name: "Woven rug",
          type: "rug",
          position: [-2.6, 0.015, 0.75],
          rotation: 0,
          scale: [1, 1, 1],
          color: "#ece4d6",
        },
        {
          id: id(),
          name: "Abstract print",
          type: "art",
          position: [-2.6, 1.5, -4.38],
          rotation: 0,
          scale: [1, 1, 1],
          color: "#9e785a",
          wallId: "back",
        },
      ]
    : [],
});
const first = {
  id: id(),
  name: "The Willow House",
  floors: [
    makeFloor("Ground floor", true),
    makeFloor("First floor", true),
    makeFloor("Second floor"),
  ],
};
export const useEditor = create(
  persist(
    (set, get) => ({
      projects: [
        first,
        { id: id(), name: "Our next chapter", floors: [makeFloor()] },
      ],
      projectId: first.id,
      floorId: first.floors[0].id,
      selected: null,
      history: [],
      future: [],
      saveError: null,
      select: (selected) => set({ selected }),
      goProject: (projectId) => {
        const p = get().projects.find((p) => p.id === projectId);
        if (p)
          set({
            projectId,
            floorId: p.floors[0].id,
            selected: null,
            history: [],
            future: [],
          });
      },
      goFloor: (floorId) =>
        set({ floorId, selected: null, history: [], future: [] }),
      addProject: (name) => {
        const p = {
          id: id(),
          name: name || "Untitled home",
          floors: [makeFloor()],
        };
        set((s) => ({
          projects: [...s.projects, p],
          projectId: p.id,
          floorId: p.floors[0].id,
          selected: null,
          history: [],
          future: [],
        }));
      },
      renameProject: (name) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.projectId ? { ...p, name } : p,
          ),
        })),
      deleteProject: () => {
        const s = get();
        if (s.projects.length === 1) return;
        const projects = s.projects.filter((p) => p.id !== s.projectId);
        set({
          projects,
          projectId: projects[0].id,
          floorId: projects[0].floors[0].id,
          selected: null,
          history: [],
          future: [],
        });
      },
      addFloor: () => {
        const s = get();
        const p = s.projects.find((p) => p.id === s.projectId);
        const f = makeFloor(`Floor ${p.floors.length + 1}`);
        set({
          projects: s.projects.map((p) =>
            p.id === s.projectId ? { ...p, floors: [...p.floors, f] } : p,
          ),
          floorId: f.id,
          selected: null,
          history: [],
          future: [],
        });
      },
      editFloor: (updater) => {
        const s = get();
        const p = s.projects.find((p) => p.id === s.projectId);
        const old = p.floors.find((f) => f.id === s.floorId);
        const next = updater(structuredClone(old));
        set({
          projects: s.projects.map((p) =>
            p.id === s.projectId
              ? {
                  ...p,
                  floors: p.floors.map((f) => (f.id === s.floorId ? next : f)),
                }
              : p,
          ),
          history: [...s.history.slice(-39), old],
          future: [],
        });
      },
      updateObject: (objectId, patch) =>
        get().editFloor((f) => ({
          ...f,
          objects: f.objects.map((o) =>
            o.id === objectId ? { ...o, ...patch } : o,
          ),
        })),
      addObject: (product) => {
        const objectId = id();
        get().editFloor((f) => ({
          ...f,
          objects: [
            ...f.objects,
            {
              id: objectId,
              name: product.name,
              type: product.type,
              color: product.color || "#b3997c",
              position:
                product.type === "art"
                  ? [0, 1.5, -f.depth / 2 + 0.12]
                  : [0, 0.02, 2],
              rotation: 0,
              scale: [1, 1, 1],
              source: product.url,
              wallId: product.type === "art" ? f.walls[0]?.id : undefined,
            },
          ],
        }));
        set({ selected: objectId });
      },
      deleteObject: (objectId) => {
        get().editFloor((f) => ({
          ...f,
          objects: f.objects.filter((o) => o.id !== objectId),
        }));
        set({ selected: null });
      },
      material: (surfaceId, patch) =>
        get().editFloor((f) => ({
          ...f,
          materials: {
            ...f.materials,
            [surfaceId]: { ...f.materials[surfaceId], ...patch },
          },
        })),
      undo: () => {
        const s = get();
        if (!s.history.length) return;
        const p = s.projects.find((p) => p.id === s.projectId);
        const now = p.floors.find((f) => f.id === s.floorId);
        const old = s.history.at(-1);
        set({
          projects: s.projects.map((p) =>
            p.id === s.projectId
              ? {
                  ...p,
                  floors: p.floors.map((f) => (f.id === s.floorId ? old : f)),
                }
              : p,
          ),
          history: s.history.slice(0, -1),
          future: [...s.future, now],
          selected: null,
        });
      },
      redo: () => {
        const s = get();
        if (!s.future.length) return;
        const p = s.projects.find((p) => p.id === s.projectId);
        const now = p.floors.find((f) => f.id === s.floorId);
        set({
          projects: s.projects.map((p) =>
            p.id === s.projectId
              ? {
                  ...p,
                  floors: p.floors.map((f) =>
                    f.id === s.floorId ? s.future.at(-1) : f,
                  ),
                }
              : p,
          ),
          history: [...s.history, now],
          future: s.future.slice(0, -1),
          selected: null,
        });
      },
    }),
    {
      name: "homer-editor-v1",
      partialize: (s) => ({
        projects: s.projects,
        projectId: s.projectId,
        floorId: s.floorId,
      }),
      storage: {
        getItem: (key) => {
          try {
            return JSON.parse(localStorage.getItem(key));
          } catch {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
            const recovered = storageFull;
            storageFull = false;
            if (recovered)
              queueMicrotask(() => useEditor.setState({ saveError: null }));
          } catch {
            if (storageFull) return;
            storageFull = true;
            queueMicrotask(() =>
              useEditor.setState({
                saveError:
                  "Browser storage is full. Export your home to keep your latest changes.",
              }),
            );
          }
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  ),
);
