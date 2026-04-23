/**
 * DATA STRUCTURE: DISJOINT SET UNION (DSU) / UNION-FIND
 * 
 * ALGORITHM EXPLANATION:
 * Used to track "Connectivity Components" across the city.
 * In GreenLedger, we don't just want more trees; we want "Connected Corridors."
 * 
 * Logic:
 * - Each ward starts in its own set.
 * - If two adjacent wards both have high NDVI (established green), we "Union" them.
 * - The DSU helps the optimizer identify "Fragmented" areas. If planting in a ward
 *   would bridge two large green components, the DSU logic detects this move and
 *   awards a "Reconnection Bonus" to that ward's priority.
 * 
 * Optimization:
 * - Path Compression: Reduces the tree height during 'find' operations to near O(1) amortized time.
 */

export class DSU {
  private parent: Record<string, string>;

  constructor(ids: string[]) {
    this.parent = {};
    ids.forEach(id => {
      this.parent[id] = id;
    });
  }

  /**
   * Find with Path Compression
   */
  find(i: string): string {
    if (this.parent[i] === i) return i;
    // Recursively find the root and compress path
    return (this.parent[i] = this.find(this.parent[i]));
  }

  /**
   * Union of two sets
   */
  union(i: string, j: string): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
      return true; // Union occurred
    }
    return false; // Already in the same set
  }

  /**
   * Returns the count of unique connected components
   */
  getComponentCount(): number {
    const roots = new Set();
    Object.keys(this.parent).forEach(id => {
      roots.add(this.find(id));
    });
    return roots.size;
  }
}
