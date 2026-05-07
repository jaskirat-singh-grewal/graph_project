// Multi-source pathfinding algorithms for the visualizer.
//
// Each algorithm returns the same shape:
//   {
//     frames: Frame[],
//     winner: { startIdx, endIdx, pathLength, cost } | null,
//     path: number[]  // cell indices from start..end inclusive (empty if no path)
//   }
//
// A Frame is one "tick" of animation:
//   {
//     newlyExplored: { idx, ownerStart }[],   // added to the closed set this tick
//     newlyFrontier: { idx, ownerStart }[],   // currently on the frontier (active wave)
//   }
//
// `ownerStart` is the *index into the starts[] array* (0..starts.length-1) of the
// start that first reached this cell. The UI uses it to tint frontiers per source.

const INF = Infinity;

const neighborsOf = (idx, rows, cols) => {
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const out = [];
  if (r > 0) out.push(idx - cols);
  if (r < rows - 1) out.push(idx + cols);
  if (c > 0) out.push(idx - 1);
  if (c < cols - 1) out.push(idx + 1);
  return out;
};

const reconstruct = (parent, target) => {
  const out = [];
  let cur = target;
  while (cur !== null && cur !== undefined) {
    out.push(cur);
    cur = parent[cur];
  }
  return out.reverse();
};

const manhattan = (a, b, cols) => {
  const ar = Math.floor(a / cols), ac = a % cols;
  const br = Math.floor(b / cols), bc = b % cols;
  return Math.abs(ar - br) + Math.abs(ac - bc);
};

const minHeuristicToAnyEnd = (idx, ends, cols) => {
  let best = INF;
  for (let i = 0; i < ends.length; i++) {
    const h = manhattan(idx, ends[i], cols);
    if (h < best) best = h;
  }
  return best;
};

// ----- BFS (level-synchronous, multi-source) ----------------------------------
const runBFS = ({ cells, starts, ends, rows, cols }) => {
  const total = rows * cols;
  const visited = new Array(total).fill(false);
  const owner = new Array(total).fill(-1);
  const parent = new Array(total).fill(null);
  const endSet = new Set(ends);
  const frames = [];

  let frontier = [];
  starts.forEach((s, i) => {
    if (cells[s].weight !== INF && !visited[s]) {
      visited[s] = true;
      owner[s] = i;
      frontier.push(s);
    }
  });

  let winner = null;
  // Check if a start is already on an end (degenerate)
  for (const s of starts) {
    if (endSet.has(s)) {
      winner = { startIdx: starts.indexOf(s), endIdx: s, pathLength: 0, cost: 0 };
      return { frames, winner, path: [s] };
    }
  }

  while (frontier.length && !winner) {
    const next = [];
    const newlyExplored = [];
    for (const cell of frontier) newlyExplored.push({ idx: cell, ownerStart: owner[cell] });
    for (const cell of frontier) {
      for (const nb of neighborsOf(cell, rows, cols)) {
        if (visited[nb]) continue;
        if (cells[nb].weight === INF) continue;
        visited[nb] = true;
        owner[nb] = owner[cell];
        parent[nb] = cell;
        if (endSet.has(nb)) {
          winner = {
            startIdx: owner[nb],
            endIdx: nb,
            pathLength: 0,
            cost: 0,
          };
          // Don't break early — finish this level so frontier reads naturally
        }
        next.push(nb);
      }
    }
    const newlyFrontier = next.map((idx) => ({ idx, ownerStart: owner[idx] }));
    frames.push({ newlyExplored, newlyFrontier });
    frontier = next;
  }

  if (!winner) return { frames, winner: null, path: [] };
  const path = reconstruct(parent, winner.endIdx);
  winner.pathLength = path.length - 1;
  winner.cost = path.length - 1;
  return { frames, winner, path };
};

// ----- DFS (multi-source, round-robin) ----------------------------------------
// DFS doesn't give shortest path; we visualize each start's stack stepping
// in lockstep round-robin until any one reaches an end.
const runDFS = ({ cells, starts, ends, rows, cols }) => {
  const total = rows * cols;
  const visited = new Array(total).fill(false);
  const owner = new Array(total).fill(-1);
  const parent = new Array(total).fill(null);
  const endSet = new Set(ends);
  const frames = [];

  const stacks = starts.map((s, i) => {
    if (cells[s].weight === INF) return [];
    visited[s] = true;
    owner[s] = i;
    return [s];
  });

  let winner = null;
  // Initial frame: show start cells as frontier
  const initFrontier = [];
  starts.forEach((s, i) => {
    if (cells[s].weight !== INF) initFrontier.push({ idx: s, ownerStart: i });
  });
  if (initFrontier.length) frames.push({ newlyExplored: initFrontier, newlyFrontier: [] });

  for (const s of starts) {
    if (endSet.has(s)) {
      winner = { startIdx: starts.indexOf(s), endIdx: s, pathLength: 0, cost: 0 };
      return { frames, winner, path: [s] };
    }
  }

  while (!winner) {
    let anyMoved = false;
    const tickExplored = [];
    const tickFrontier = [];
    for (let i = 0; i < stacks.length && !winner; i++) {
      const stk = stacks[i];
      // Pop until we find a cell with an unvisited neighbor or stack empties
      let pushed = false;
      while (stk.length && !pushed) {
        const top = stk[stk.length - 1];
        let advanced = false;
        for (const nb of neighborsOf(top, rows, cols)) {
          if (visited[nb] || cells[nb].weight === INF) continue;
          visited[nb] = true;
          owner[nb] = i;
          parent[nb] = top;
          stk.push(nb);
          tickExplored.push({ idx: nb, ownerStart: i });
          tickFrontier.push({ idx: nb, ownerStart: i });
          advanced = true;
          pushed = true;
          if (endSet.has(nb)) {
            winner = { startIdx: i, endIdx: nb, pathLength: 0, cost: 0 };
          }
          break;
        }
        if (!advanced) stk.pop();
      }
      if (pushed) anyMoved = true;
    }
    if (!anyMoved) break;
    frames.push({ newlyExplored: tickExplored, newlyFrontier: tickFrontier });
  }

  if (!winner) return { frames, winner: null, path: [] };
  const path = reconstruct(parent, winner.endIdx);
  winner.pathLength = path.length - 1;
  winner.cost = path.length - 1;
  return { frames, winner, path };
};

// ----- Min-heap for Dijkstra / A* ---------------------------------------------
class MinHeap {
  constructor() { this.h = []; }
  size() { return this.h.length; }
  push(item) {
    this.h.push(item);
    this._up(this.h.length - 1);
  }
  pop() {
    const top = this.h[0];
    const last = this.h.pop();
    if (this.h.length) {
      this.h[0] = last;
      this._down(0);
    }
    return top;
  }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[p].key <= this.h[i].key) break;
      [this.h[p], this.h[i]] = [this.h[i], this.h[p]];
      i = p;
    }
  }
  _down(i) {
    const n = this.h.length;
    while (true) {
      const l = i * 2 + 1, r = l + 1;
      let s = i;
      if (l < n && this.h[l].key < this.h[s].key) s = l;
      if (r < n && this.h[r].key < this.h[s].key) s = r;
      if (s === i) break;
      [this.h[s], this.h[i]] = [this.h[i], this.h[s]];
      i = s;
    }
  }
}

// ----- Dijkstra (multi-source) ------------------------------------------------
// Frames batch all pops with the same distance value to give a cleaner
// "wavefront" feel; the visual cadence then resembles BFS with ripples.
const runDijkstra = ({ cells, starts, ends, rows, cols }) => {
  const total = rows * cols;
  const dist = new Array(total).fill(INF);
  const owner = new Array(total).fill(-1);
  const parent = new Array(total).fill(null);
  const closed = new Array(total).fill(false);
  const endSet = new Set(ends);
  const frames = [];
  const heap = new MinHeap();

  starts.forEach((s, i) => {
    if (cells[s].weight === INF) return;
    if (0 < dist[s]) {
      dist[s] = 0;
      owner[s] = i;
      heap.push({ key: 0, idx: s });
    }
  });

  for (const s of starts) {
    if (endSet.has(s)) {
      return {
        frames,
        winner: { startIdx: starts.indexOf(s), endIdx: s, pathLength: 0, cost: 0 },
        path: [s],
      };
    }
  }

  let winner = null;
  let currentBatchKey = null;
  let batchExplored = [];
  let batchFrontier = [];

  const flushBatch = () => {
    if (batchExplored.length || batchFrontier.length) {
      frames.push({ newlyExplored: batchExplored, newlyFrontier: batchFrontier });
    }
    batchExplored = [];
    batchFrontier = [];
  };

  while (heap.size() && !winner) {
    const { key, idx } = heap.pop();
    if (closed[idx]) continue;
    if (key !== dist[idx]) continue;
    closed[idx] = true;
    if (currentBatchKey === null) currentBatchKey = key;
    if (key !== currentBatchKey) {
      flushBatch();
      currentBatchKey = key;
    }
    batchExplored.push({ idx, ownerStart: owner[idx] });
    if (endSet.has(idx)) {
      winner = { startIdx: owner[idx], endIdx: idx, pathLength: 0, cost: dist[idx] };
      break;
    }
    for (const nb of neighborsOf(idx, rows, cols)) {
      if (closed[nb]) continue;
      const w = cells[nb].weight;
      if (w === INF) continue;
      const nd = dist[idx] + w;
      if (nd < dist[nb]) {
        dist[nb] = nd;
        owner[nb] = owner[idx];
        parent[nb] = idx;
        heap.push({ key: nd, idx: nb });
        batchFrontier.push({ idx: nb, ownerStart: owner[nb] });
      }
    }
  }
  flushBatch();

  if (!winner) return { frames, winner: null, path: [] };
  const path = reconstruct(parent, winner.endIdx);
  winner.pathLength = path.length - 1;
  return { frames, winner, path };
};

// ----- A* (multi-source) ------------------------------------------------------
// f = g + h, where h = min Manhattan distance to ANY end. With multiple ends
// the heuristic stays admissible (it never overestimates the true min cost).
const runAStar = ({ cells, starts, ends, rows, cols }) => {
  const total = rows * cols;
  const g = new Array(total).fill(INF);
  const owner = new Array(total).fill(-1);
  const parent = new Array(total).fill(null);
  const closed = new Array(total).fill(false);
  const endSet = new Set(ends);
  const frames = [];
  const heap = new MinHeap();

  starts.forEach((s, i) => {
    if (cells[s].weight === INF) return;
    if (0 < g[s]) {
      g[s] = 0;
      owner[s] = i;
      heap.push({ key: minHeuristicToAnyEnd(s, ends, cols), idx: s });
    }
  });

  for (const s of starts) {
    if (endSet.has(s)) {
      return {
        frames,
        winner: { startIdx: starts.indexOf(s), endIdx: s, pathLength: 0, cost: 0 },
        path: [s],
      };
    }
  }

  let winner = null;
  while (heap.size() && !winner) {
    const { idx } = heap.pop();
    if (closed[idx]) continue;
    closed[idx] = true;
    const newlyExplored = [{ idx, ownerStart: owner[idx] }];
    const newlyFrontier = [];
    if (endSet.has(idx)) {
      winner = { startIdx: owner[idx], endIdx: idx, pathLength: 0, cost: g[idx] };
      frames.push({ newlyExplored, newlyFrontier });
      break;
    }
    for (const nb of neighborsOf(idx, rows, cols)) {
      if (closed[nb]) continue;
      const w = cells[nb].weight;
      if (w === INF) continue;
      const ng = g[idx] + w;
      if (ng < g[nb]) {
        g[nb] = ng;
        owner[nb] = owner[idx];
        parent[nb] = idx;
        const f = ng + minHeuristicToAnyEnd(nb, ends, cols);
        heap.push({ key: f, idx: nb });
        newlyFrontier.push({ idx: nb, ownerStart: owner[nb] });
      }
    }
    frames.push({ newlyExplored, newlyFrontier });
  }

  if (!winner) return { frames, winner: null, path: [] };
  const path = reconstruct(parent, winner.endIdx);
  winner.pathLength = path.length - 1;
  return { frames, winner, path };
};

export const ALGORITHMS = {
  bfs: { label: "Breadth-First Search", weighted: false, run: (ctx) => runBFS({ ...ctx, cells: stripWeights(ctx.cells) }) },
  dfs: { label: "Depth-First Search", weighted: false, run: (ctx) => runDFS({ ...ctx, cells: stripWeights(ctx.cells) }) },
  dijkstra: { label: "Dijkstra's Algorithm", weighted: true, run: runDijkstra },
  astar: { label: "A* Search", weighted: true, run: runAStar },
};

// For unweighted algos: collapse all finite weights to 1 (walls stay Infinity).
const stripWeights = (cells) =>
  cells.map((c) => (c.weight === INF ? c : { ...c, weight: 1 }));

export const runAlgorithm = (algoKey, ctx) => {
  const algo = ALGORITHMS[algoKey] || ALGORITHMS.bfs;
  return algo.run(ctx);
};
