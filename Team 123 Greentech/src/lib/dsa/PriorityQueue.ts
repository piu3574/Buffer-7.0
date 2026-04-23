/**
 * DATA STRUCTURE: PRIORITY QUEUE (Max-Heap Implementation)
 * 
 * ALGORITHM EXPLANATION:
 * The Priority Queue is essential for the "Greedy" portion of our optimization.
 * Instead of sorting the entire list of wards (O(N log N)) every time we pick a spot,
 * we use a Heap-based Priority Queue.
 * 
 * Efficiency:
 * - Insert (Push): O(log N)
 * - Extract Max (Pop): O(log N)
 * - Peek: O(1)
 * 
 * Dynamic prioritization allows our optimizer to pick the "best" ward for planting
 * in real-time as state variables (like local NDVI) change.
 */

export class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  push(item: T, priority: number) {
    this.heap.push({ item, priority });
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    const top = this.heap[0].item;
    const last = this.heap.pop()!;
    if (this.size() > 0) {
      this.heap[0] = last;
      this.sinkDown();
    }
    return top;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority >= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private sinkDown() {
    let index = 0;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let swap = -1;

      if (left < this.size()) {
        if (this.heap[left].priority > this.heap[index].priority) swap = left;
      }

      if (right < this.size()) {
        if (
          (swap === -1 && this.heap[right].priority > this.heap[index].priority) ||
          (swap !== -1 && this.heap[right].priority > this.heap[left].priority)
        ) swap = right;
      }

      if (swap === -1) break;
      [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
      index = swap;
    }
  }
}
