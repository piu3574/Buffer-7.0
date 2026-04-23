/**
 * DATA STRUCTURE: GRAPH (Adjacency List)
 * 
 * ALGORITHM EXPLANATION:
 * The city is modeled as a Directed/Undirected Graph.
 * Nodes represent Wards.
 * Edges represent ecological relationships:
 * - Adjacency: Physical borders.
 * - Wind Corridors: Theoretical paths for air cooling.
 * - Drainage: Natural water flow paths.
 * 
 * This structure allows us to perform Graph Traversals (like BFS) to simulate
 * how environmental improvements "leak" or "spread" from one ward to another.
 */

import { AdjacencyList, Ward } from './types';

export const ADJACENCY_LIST: AdjacencyList = {
  'hadapsar': [{ to: 'wanowrie', type: 'adjacency' }, { to: 'yerawada', type: 'wind' }],
  'wanowrie': [{ to: 'hadapsar', type: 'adjacency' }, { to: 'kondhwa', type: 'drainage' }, { to: 'bibvewadi', type: 'adjacency' }],
  'kondhwa': [{ to: 'wanowrie', type: 'drainage' }, { to: 'bibvewadi', type: 'adjacency' }],
  'bibvewadi': [{ to: 'wanowrie', type: 'adjacency' }, { to: 'kondhwa', type: 'adjacency' }, { to: 'shivajinagar', type: 'wind' }],
  'kothrud': [{ to: 'warje', type: 'adjacency' }, { to: 'shivajinagar', type: 'adjacency' }, { to: 'pashan', type: 'adjacency' }],
  'shivajinagar': [{ to: 'kothrud', type: 'adjacency' }, { to: 'yerawada', type: 'adjacency' }, { to: 'bibvewadi', type: 'wind' }],
  'yerawada': [{ to: 'shivajinagar', type: 'adjacency' }, { to: 'viman_nagar', type: 'adjacency' }, { to: 'hadapsar', type: 'wind' }],
  'viman_nagar': [{ to: 'yerawada', type: 'adjacency' }, { to: 'hadapsar', type: 'adjacency' }],
  'pashan': [{ to: 'kothrud', type: 'adjacency' }, { to: 'baner', type: 'drainage' }],
  'baner': [{ to: 'pashan', type: 'drainage' }, { to: 'aundh', type: 'adjacency' }],
  'aundh': [{ to: 'baner', type: 'adjacency' }, { to: 'shivajinagar', type: 'adjacency' }],
  'warje': [{ to: 'kothrud', type: 'adjacency' }]
};

export const WARDS_DATA: Record<string, Ward> = {
  'hadapsar': {
    id: 'hadapsar', name: 'Hadapsar', ndvi: 0.12, population: 450000, maxPopulation: 500000,
    heatExcess: 4.2, maxHeatExcess: 5.0, floodRisk: 7, windPotential: 0.6, pollution: 0.8,
    centroid: [18.5089, 73.9259], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Black Cotton',
    availableSpaces: [{ id: 'h1', name: 'Pune Solapur Roadside', type: 'Roadside', areaSqMeters: 1200, estCapacity: 200 }, { id: 'h2', name: 'Magarpatta Empty Plot', type: 'Empty Plot', areaSqMeters: 5000, estCapacity: 1200 }]
  },
  'wanowrie': {
    id: 'wanowrie', name: 'Wanowrie', ndvi: 0.22, population: 120000, maxPopulation: 500000,
    heatExcess: 2.1, maxHeatExcess: 5.0, floodRisk: 3, windPotential: 0.4, pollution: 0.5,
    centroid: [18.4879, 73.8966], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Red Laterite',
    availableSpaces: [{ id: 'w1', name: 'Fatima Nagar Park', type: 'Park', areaSqMeters: 3000, estCapacity: 800 }]
  },
  'kondhwa': {
    id: 'kondhwa', name: 'Kondhwa', ndvi: 0.18, population: 380000, maxPopulation: 500000,
    heatExcess: 3.8, maxHeatExcess: 5.0, floodRisk: 6, windPotential: 0.5, pollution: 0.9,
    centroid: [18.4754, 73.8890], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Clay Loam',
    availableSpaces: [{ id: 'k1', name: 'NIBM Roadside', type: 'Roadside', areaSqMeters: 800, estCapacity: 150 }]
  },
  'bibvewadi': {
    id: 'bibvewadi', name: 'Bibvewadi', ndvi: 0.28, population: 150000, maxPopulation: 500000,
    heatExcess: 1.8, maxHeatExcess: 5.0, floodRisk: 2, windPotential: 0.3, pollution: 0.4,
    centroid: [18.4795, 73.8617], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Sandy Loam',
    availableSpaces: [{ id: 'b1', name: 'VIT College Ground', type: 'School Ground', areaSqMeters: 4500, estCapacity: 1000 }]
  },
  'kothrud': {
    id: 'kothrud', name: 'Kothrud', ndvi: 0.35, population: 400000, maxPopulation: 500000,
    heatExcess: 1.5, maxHeatExcess: 5.0, floodRisk: 1, windPotential: 0.4, pollution: 0.6,
    centroid: [18.5074, 73.8077], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Black Cotton',
    availableSpaces: [{ id: 'ko1', name: 'Karve Road Plot', type: 'Empty Plot', areaSqMeters: 2000, estCapacity: 450 }]
  },
  'shivajinagar': {
    id: 'shivajinagar', name: 'Shivajinagar', ndvi: 0.30, population: 280000, maxPopulation: 500000,
    heatExcess: 2.5, maxHeatExcess: 5.0, floodRisk: 4, windPotential: 0.5, pollution: 0.7,
    centroid: [18.5308, 73.8475], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Clay Loam',
    availableSpaces: [{ id: 's1', name: 'Sancheti Hospital Ground', type: 'Hospital Ground', areaSqMeters: 1500, estCapacity: 350 }]
  },
  'yerawada': {
    id: 'yerawada', name: 'Yerawada', ndvi: 0.14, population: 420000, maxPopulation: 500000,
    heatExcess: 4.5, maxHeatExcess: 5.0, floodRisk: 8, windPotential: 0.7, pollution: 0.9,
    centroid: [18.5529, 73.8824], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Red Laterite',
    availableSpaces: [{ id: 'y1', name: 'Airport Road', type: 'Roadside', areaSqMeters: 3000, estCapacity: 600 }]
  },
  'viman_nagar': {
    id: 'viman_nagar', name: 'Viman Nagar', ndvi: 0.20, population: 250000, maxPopulation: 500000,
    heatExcess: 3.0, maxHeatExcess: 5.0, floodRisk: 5, windPotential: 0.6, pollution: 0.6,
    centroid: [18.5679, 73.9143], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Sandy Loam',
    availableSpaces: [{ id: 'v1', name: 'Symbiosis Campus', type: 'School Ground', areaSqMeters: 6000, estCapacity: 1500 }]
  },
  'pashan': {
    id: 'pashan', name: 'Pashan', ndvi: 0.40, population: 100000, maxPopulation: 500000,
    heatExcess: 1.0, maxHeatExcess: 5.0, floodRisk: 2, windPotential: 0.8, pollution: 0.3,
    centroid: [18.5397, 73.7915], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Black Cotton',
    availableSpaces: []
  },
  'baner': {
    id: 'baner', name: 'Baner', ndvi: 0.32, population: 180000, maxPopulation: 500000,
    heatExcess: 2.0, maxHeatExcess: 5.0, floodRisk: 3, windPotential: 0.5, pollution: 0.4,
    centroid: [18.5597, 73.7799], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Clay Loam',
    availableSpaces: [{ id: 'ba1', name: 'Baner Hills Open Space', type: 'Empty Plot', areaSqMeters: 10000, estCapacity: 2500 }]
  },
  'aundh': {
    id: 'aundh', name: 'Aundh', ndvi: 0.28, population: 200000, maxPopulation: 500000,
    heatExcess: 2.2, maxHeatExcess: 5.0, floodRisk: 3, windPotential: 0.4, pollution: 0.5,
    centroid: [18.5604, 73.8058], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Sandy Loam',
    availableSpaces: [{ id: 'a1', name: 'Aundh Park', type: 'Park', areaSqMeters: 2500, estCapacity: 700 }]
  },
  'warje': {
    id: 'warje', name: 'Warje', ndvi: 0.25, population: 300000, maxPopulation: 500000,
    heatExcess: 3.2, maxHeatExcess: 5.0, floodRisk: 6, windPotential: 0.3, pollution: 0.7,
    centroid: [18.4842, 73.8000], deficitScore: 0, saplingsPlanted: 0, lastInspected: null,
    soilType: 'Red Laterite',
    availableSpaces: [{ id: 'wa1', name: 'Highway Bypass', type: 'Roadside', areaSqMeters: 1800, estCapacity: 400 }]
  }
};
