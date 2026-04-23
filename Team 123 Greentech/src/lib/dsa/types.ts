/**
 * SHARED TYPES FOR GREENLEDGER ENGINE
 */

export interface PlantingSpace {
  id: string;
  name: string;
  type: 'Empty Plot' | 'Roadside' | 'Park' | 'School Ground' | 'Hospital Ground';
  areaSqMeters: number;
  estCapacity: number;
  coordinates?: [number, number];
  inheritedSoilType?: string;
}

export interface Ward {
  id: string;
  name: string;
  ndvi: number;
  population: number;
  maxPopulation: number;
  heatExcess: number;
  maxHeatExcess: number;
  floodRisk: number; // 0-10
  windPotential: number; // 0-1
  pollution: number; // 0-1
  centroid: [number, number]; // [lat, lng]
  deficitScore: number;
  saplingsPlanted: number;
  lastInspected: string | null;
  soilType: 'Clay Loam' | 'Sandy Loam' | 'Black Cotton' | 'Red Laterite';
  availableSpaces: PlantingSpace[];
}

export interface Edge {
  to: string;
  type: 'adjacency' | 'wind' | 'drainage';
}

export type AdjacencyList = Record<string, Edge[]>;

export interface Alert {
  id: number;
  msg: string;
  time: string;
}

export interface OptimizationPlanItem {
  wardId: string;
  wardName: string;
  count: number;
  score: number;
  species: string[];
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
}
