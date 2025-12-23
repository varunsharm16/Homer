# Homer - 3D Home Designer

A web-based AI-powered home design application that transforms 2D floor plans into interactive 3D models.

## Features

- **Floor Plan → 3D Conversion**: Upload a floor plan image and AI extracts rooms, walls, and dimensions to generate a 3D model
- **Natural Language Editing**: Describe changes like "add a sofa in the living room" and AI applies them
- **Interactive 3D Viewer**: Orbit, zoom, and click surfaces to select and customize
- **Multi-Surface Selection**: Click multiple walls/floors to batch-apply materials
- **Image-Based Styling**: Upload furniture photos or material swatches to apply styles

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| 3D Rendering | Three.js + React Three Fiber |
| State | Zustand |
| Styling | Tailwind CSS |
| AI | OpenAI GPT-4o / GPT-4o-mini |
| Backend | Vercel Serverless Functions |

## Project Structure

```
3d-home-designer/
├── api/                        # Serverless API routes
│   ├── classify-image.js       # Image type classification
│   ├── parse-floorplan.js      # Floor plan → Scene DSL
│   └── scene-command.js        # NL command → scene operations
├── public/
│   └── models/                 # 3D furniture models (GLTF)
├── src/
│   ├── components/
│   │   ├── CenterView.jsx      # 3D canvas + chat input
│   │   ├── LeftSidebar.jsx     # Projects list
│   │   └── RightSidebar.jsx    # Products catalog
│   ├── lib/
│   │   ├── sceneStore.js       # Zustand scene state
│   │   └── api.js              # API client utilities
│   ├── App.jsx                 # Main application
│   └── main.jsx                # Entry point
├── vercel.json                 # Deployment config
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd 3d-home-designer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Add OpenAI API key
vercel env add OPENAI_API_KEY

# Deploy
vercel --prod
```

## Usage

1. **Create Project**: Click "+" in the left sidebar
2. **Upload Floor Plan**: Click "+" in chat box → Upload Photo
3. **Confirm Preview**: Review detected rooms, click "Generate 3D"
4. **Customize**: 
   - Click surfaces to select
   - Type commands like "paint the walls blue"
   - Upload material photos to apply textures
5. **Navigate**: Drag to orbit, scroll to zoom

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/classify-image` | Classify image type (floor_plan, furniture, material, room_photo) |
| `POST /api/parse-floorplan` | Extract Scene DSL from floor plan image |
| `POST /api/scene-command` | Execute natural language command on scene |

## Scene DSL Schema

```json
{
  "version": "1.0",
  "rooms": [{ "id": "room_1", "name": "Kitchen", "bounds": [[0,0], [10,8]], "height": 9 }],
  "walls": [{ "id": "wall_1", "from": [0,0], "to": [10,0], "height": 9 }],
  "openings": [{ "id": "door_1", "wallId": "wall_1", "type": "door", "position": 3,  "width": 3 }],
  "objects": [{ "id": "obj_1", "type": "sofa", "position": [5,0,3], "rotation": 90 }],
  "materials": { "wall_1": { "type": "paint", "color": "#ffffff" } }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o/4o-mini |

## License

MIT
