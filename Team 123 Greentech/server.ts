import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// --- DSA Modules ---
import { Ward, Edge, AdjacencyList, Alert } from './src/lib/dsa/types';
import { validateOptimizationInput } from './src/lib/utils';
import { ADJACENCY_LIST, WARDS_DATA } from './src/lib/dsa/Graph';
import { PriorityQueue } from './src/lib/dsa/PriorityQueue';
import { DSU } from './src/lib/dsa/UnionFind';
import { calculateDeficitScore } from './src/lib/dsa/Scoring';
import { runGreedyOptimization } from './src/lib/dsa/Optimizer';
import { spreadEnvironmentalImpact } from './src/lib/dsa/ImpactBFS';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SSE Setup ---
let clients: any[] = [];
const broadcast = (data: any) => {
  clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`));
};

// --- Engine Logic ---
class GreenLedgerEngine {
  wards: Record<string, Ward>;
  alerts: Alert[] = [];

  constructor() {
    this.wards = JSON.parse(JSON.stringify(WARDS_DATA));
    Object.values(this.wards).forEach(w => {
      w.availableSpaces.forEach((space, idx) => {
        space.coordinates = [
          w.centroid[0] + (Math.random() - 0.5) * 0.015,
          w.centroid[1] + (Math.random() - 0.5) * 0.015
        ];
        space.inheritedSoilType = w.soilType;
      });
    });
    this.calculateAllScores();
  }

  calculateAllScores() {
    Object.values(this.wards).forEach(w => {
      w.deficitScore = calculateDeficitScore(w);
    });
  }

  getConnectedCorridors() {
    const dsu = new DSU(Object.keys(this.wards));
    Object.keys(ADJACENCY_LIST).forEach(u => {
      ADJACENCY_LIST[u].forEach(edge => {
        const v = edge.to;
        if (this.wards[u].ndvi > 0.35 && this.wards[v].ndvi > 0.35) {
          dsu.union(u, v);
        }
      });
    });
    return dsu;
  }

  optimize(totalSaplings: number, budget: number) {
    return runGreedyOptimization(
      this.wards, 
      ADJACENCY_LIST, 
      totalSaplings, 
      this.getSpeciesRecommendation
    );
  }

  getSpeciesRecommendation(w: Ward) {
    if (w.heatExcess > 4) return ['Neem', 'Peepal', 'Banyan'];
    if (w.floodRisk > 7) return ['Jamun', 'Bamboo', 'Arjun'];
    return ['Mango', 'Gulmohar', 'Ashoka'];
  }

  recordPlanting(wardId: string, count: number) {
    if (!this.wards[wardId]) return;
    
    // 1. Direct update
    this.wards[wardId].saplingsPlanted += count;
    this.wards[wardId].ndvi = Math.min(0.9, this.wards[wardId].ndvi + (count / 10000));
    
    // 2. BFS Impact Spread (Spread environmental benefits to neighbors)
    spreadEnvironmentalImpact(wardId, count, this.wards, ADJACENCY_LIST);

    this.calculateAllScores();
    this.addAlert(`Recorded ${count} saplings in ${this.wards[wardId].name}. Corridor impact spreading...`);
    broadcast({ type: 'UPDATE', wards: this.wards, alerts: this.alerts });
  }

  simulateSatelliteUpdate() {
    Object.values(this.wards).forEach(w => {
      const variation = (Math.random() - 0.4) * 0.02;
      w.ndvi = Math.max(0.05, Math.min(0.95, w.ndvi + variation));
    });
    this.calculateAllScores();
    this.addAlert(`Sentinel-2 Satellite Pass: NDVI values refreshed city-wide.`);
    broadcast({ type: 'UPDATE', wards: this.wards, alerts: this.alerts });
  }

  addAlert(msg: string) {
    this.alerts.unshift({ id: Date.now(), msg, time: new Date().toLocaleTimeString() });
    if (this.alerts.length > 20) this.alerts.pop();
  }
}

const engine = new GreenLedgerEngine();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '2.1.0'
    });
  });
  app.get('/api/wards', (req, res) => {
    try {
      res.json(engine.wards);
    } catch (error) {
      console.error('Error fetching wards:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/alerts', (req, res) => {
    try {
      res.json(engine.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/planting-spots', (req, res) => {
    try {
      const allSpots: any[] = [];
      Object.values(engine.wards).forEach(w => {
        w.availableSpaces.forEach(space => {
          allSpots.push({ ...space, wardId: w.id, wardName: w.name });
        });
      });
      res.json(allSpots);
    } catch (error) {
      console.error('Error fetching planting spots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/graph', (req, res) => {
    try {
      res.json(ADJACENCY_LIST);
    } catch (error) {
      console.error('Error fetching graph:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/optimize', (req, res) => {
    try {
      const { saplings, budget } = req.body;
      const validation = validateOptimizationInput(saplings, budget);
      
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }
      
      const plan = engine.optimize(saplings, budget);
      res.json(plan);
    } catch (error) {
      console.error('Error running optimization:', error);
      res.status(500).json({ error: 'Optimization failed' });
    }
  });

  app.post('/api/record-planting', (req, res) => {
    try {
      const { wardId, count } = req.body;
      if (typeof wardId !== 'string' || typeof count !== 'number') {
        return res.status(400).json({ error: 'Invalid input: wardId must be string, count must be number' });
      }
      engine.recordPlanting(wardId, count);
      res.json({ success: true });
    } catch (error) {
      console.error('Error recording planting:', error);
      res.status(500).json({ error: 'Failed to record planting' });
    }
  });

  app.post('/api/simulate-satellite', (req, res) => {
    try {
      engine.simulateSatelliteUpdate();
      res.json({ success: true });
    } catch (error) {
      console.error('Error simulating satellite:', error);
      res.status(500).json({ error: 'Satellite simulation failed' });
    }
  });

  // --- SSE Endpoint ---
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);
    req.on('close', () => {
      clients = clients.filter(c => c.id !== clientId);
    });
  });

  // --- Vite / Frontend Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GreenLedger Server running on http://localhost:${PORT}`);
  });
}

startServer();
