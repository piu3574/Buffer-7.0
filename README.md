# Buffer-7.0 (GreenLedger)
GreenLedger is a city-scale **urban tree plantation planning & tracking** app built for a “field officer” workflow. It models city wards as a connected network and generates an optimized planting plan, visualizes wards on an interactive map, and streams real-time updates (simulated satellite NDVI refresh + corridor impact spread).
## Problem Statement (Short)
Cities need to decide **where to plant limited saplings** to maximize environmental benefit (reduce heat stress, improve green cover/NDVI, lower flood/pollution risk) while considering **ward-level constraints** and **how benefits propagate to neighboring wards** through ecological corridors (adjacency, wind, drainage).
## Key Features
- **Ward dashboard**: NDVI/deficit scoring per ward + critical zone identification
- **Optimization**: generates a recommended plantation plan for a given sapling count/budget
- **Corridor impact simulation**: planting in one ward spreads environmental impact to neighbors
- **Interactive map**: ward visualization using Leaflet
- **Real-time updates**: Server-Sent Events (SSE) stream updates to the UI
- **Satellite pass simulation**: refreshes NDVI values city-wide
## Data Structures & Algorithms Used
- **Graph (Adjacency List)**: wards as nodes, ecological relations as edges (`adjacency`, `wind`, `drainage`)
- **BFS (Graph Traversal)**: spreads planting impact across neighboring wards
- **Disjoint Set Union (Union-Find / DSU)**: finds connected “green corridors” based on NDVI thresholds
- **Priority Queue**: supports greedy selection/ranking in planning workflows
- **Greedy Optimization**: allocates saplings to high-need/high-impact wards under constraints
- **Scoring Function**: computes a ward “deficit score” from NDVI, heat excess, flood risk, etc.
## Tech Stack
### Frontend
- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Leaflet / React-Leaflet** (maps)
- **Recharts** (charts)
- **shadcn/ui** + **lucide-react** (UI)
### Backend
- **Node.js** + **Express**
- **TypeScript** (`tsx` dev runner)
- **SSE** for real-time streaming
- **dotenv** for environment variables
### Optional / Integrations
- **Google Gemini API** (`@google/genai`) for AI-assisted workflows (if enabled)
## Project Structure (High-Level)
- `server.ts` — Express API + SSE + Vite middleware + core “engine” orchestration
- `src/` — React app
- `src/lib/dsa/` — Graph + DSU + Priority Queue + BFS impact + scoring + optimizer
## Run Locally
### Prerequisites
- **Node.js 18+** (recommended: latest LTS)
### Setup
1. Install dependencies:
   ```bash
   npm install
(Optional) Create an env file for keys:

Create greenledge/.env.local (or .env) and add:
GEMINI_API_KEY=YOUR_KEY
Start the app (backend + frontend via Vite middleware):

npm run dev
Open:

http://localhost:3000
API (Quick Reference)
GET /api/health — health check
GET /api/wards — ward dataset (live state)
GET /api/graph — adjacency list graph
GET /api/alerts — alerts feed
GET /api/planting-spots — all potential planting spots
POST /api/optimize — generate plan { saplings, budget }
POST /api/record-planting — record planting { wardId, count }
POST /api/simulate-satellite — simulate Sentinel-like NDVI refresh
GET /api/events — SSE stream for live updates
Notes
Satellite data is currently simulated (NDVI refresh + variation) to demonstrate the workflow end-to-end.
The city model is based on a ward graph, enabling corridor-aware planning and impact propagation.


🔗 Link to GreenLedger Demo:
https://drive.google.com/file/d/1jwM0caK2I57kTFN-bEn-76uoRKu8M8sb/view?usp=sharing
