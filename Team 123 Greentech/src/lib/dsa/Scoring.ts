/**
 * ALGORITHM: WEIGHTED DEFICIT SCORING
 * 
 * ALGORITHM EXPLANATION:
 * The Deficit Score is a normalized weighted sum of various environmental 
 * and urban factors. This "Scoring Function" is essentially a mapping of
 * high-dimensional state space (NDVI, Pop, Heat, Flood) into a single 
 * prioritized scalar.
 * 
 * Weights are calibrated for Pune PMC:
 * - 35% Vegetation Gap (1 - NDVI)
 * - 20% Population Density Burden
 * - 18% Heat Excess Flux
 * - 12% Flood Resilience Gap
 * - 15% Secondary Factors (Wind & Pollution)
 */

import { Ward } from './types';

export function calculateDeficitScore(w: Ward): number {
  const s = 0.35 * (1 - w.ndvi) +
            0.20 * (w.population / w.maxPopulation) +
            0.18 * (w.heatExcess / w.maxHeatExcess) +
            0.12 * (w.floodRisk / 10) +
            0.08 * w.windPotential +
            0.07 * w.pollution;
  return Number(s.toFixed(4));
}
