/**
 * ALGORITHM: MULTI-LEVEL GREEDY OPTIMIZER
 * 
 * ALGORITHM EXPLANATION:
 * The Optimizer uses a Greedy strategy to build a planting plan.
 * At each step, it identifies the ward with the highest "Effective Priority" 
 * and selects it for a planting batch.
 * 
 * It incorporates:
 * 1. Base Deficit: From Scoring.ts.
 * 2. Connectivity Bonus: Boosts wards if they help form corridors (using DSU logic).
 * 3. Eco-Multipliers: Boosts 1.4x for Wind Potential and 1.3x for Drainage alignment.
 * 4. Local Proximity Bias: Encourages clustering (higher survival risk) or 
 *    dispersion (wider impact).
 * 
 * The algorithm simulates "planting" in a ward (updating its state) locally during 
 * the loop so subsequent choices are aware of previous decisions.
 */

import { PriorityQueue } from './PriorityQueue';
import { Ward, AdjacencyList } from './types';
import { calculateDeficitScore } from './Scoring';

export function runGreedyOptimization(
  wards: Record<string, Ward>, 
  graph: AdjacencyList,
  totalSaplings: number,
  getSpeciesRec: (w: Ward) => string[]
) {
  const plan: any[] = [];
  let remainingSaplings = totalSaplings;
  const currentWards = JSON.parse(JSON.stringify(wards));
  let lastPickedId: string | null = null;

  while (remainingSaplings > 0 && plan.length < 20) { // Limit to 20 batches for efficiency
    const pq = new PriorityQueue<string>();
    
    Object.values(currentWards).forEach((w: any) => {
      let base = w.deficitScore;
      let windBonus = 1;
      let drainBonus = 1;
      let corridorBonus = 1;

      (graph[w.id] || []).forEach(edge => {
        if (edge.type === 'wind') windBonus = 1.4;
        if (edge.type === 'drainage') drainBonus = 1.3;
        if (currentWards[edge.to].ndvi > 0.25) corridorBonus = 2.0;
      });

      let proxWeight = 1.0;
      if (lastPickedId) {
         const isNeighbor = (graph[lastPickedId] || []).some(e => e.to === w.id);
         proxWeight = isNeighbor ? 1.5 : 0.5; 
      }

      const effective = base * corridorBonus * windBonus * drainBonus * proxWeight;
      pq.push(w.id, effective);
    });

    const bestWardId = pq.pop();
    if (!bestWardId) break;
    
    const ward = currentWards[bestWardId];
    const saplingsToPlant = Math.min(2500, remainingSaplings);
    remainingSaplings -= saplingsToPlant;
    lastPickedId = bestWardId;

    plan.push({
      wardId: bestWardId,
      wardName: ward.name,
      count: saplingsToPlant,
      score: ward.deficitScore,
      species: getSpeciesRec(ward)
    });

    // Update state for next greedy pick
    ward.ndvi += 0.05;
    ward.deficitScore = calculateDeficitScore(ward);
  }

  return plan;
}
