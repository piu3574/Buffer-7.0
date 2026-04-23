/**
 * ALGORITHM: BREADTH-FIRST SEARCH (BFS) IMPACT SPREAD
 * 
 * ALGORITHM EXPLANATION:
 * This algorithm simulates the "spillover" environmental impact of tree plantation.
 * When a batch of trees is planted in one ward, the cooling and air-quality 
 * benefits spread to adjacent wards in the graph.
 * 
 * Logic:
 * 1. Start at the source ward (planting location).
 * 2. Traverse neighbors using a queue (BFS).
 * 3. Update the NDVI (vegetation health) of neighbors up to a certain Depth (e.g., Level 2).
 * 4. The impact decays exponentially with distance from the source.
 */

import { Ward, AdjacencyList } from './types';

export function spreadEnvironmentalImpact(
  wardId: string, 
  count: number, 
  wards: Record<string, Ward>, 
  graph: AdjacencyList
) {
  const visited = new Set<string>();
  const queue = [{ id: wardId, depth: 0 }];
  visited.add(wardId);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depth > 2) continue; // Limit impact to neighbors 2 hops away

    if (id !== wardId) {
      // Impact decreases with depth: impact = (total / scale) / (depth + 1)
      const impact = (count / 20000) / (depth + 1);
      wards[id].ndvi = Math.min(0.9, wards[id].ndvi + impact);
    }

    (graph[id] || []).forEach(edge => {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push({ id: edge.to, depth: depth + 1 });
      }
    });
  }
}
