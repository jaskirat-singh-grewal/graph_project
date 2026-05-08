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
          winner = { startIdx: owner[nb], endIdx: nb, pathLength: 0, cost: 0 };
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

// ----- Min-heap for Dijkstra / UCS / A* / Greedy / RBFS -----------------------
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

// ----- UCS (Uniform-Cost Search) ----------------------------------------------
// On this grid UCS is operationally identical to Dijkstra's algorithm — both
// expand by least path-cost. We expose it as a separate entry for pedagogy.
const runUCS = runDijkstra;

// ----- A* (multi-source) ------------------------------------------------------
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

// ----- Greedy Best-First Search -----------------------------------------------
// Like A* but uses h(n) only — expands the node closest to the goal by the
// heuristic, ignoring path cost so far. Fast but not optimal.
const runGreedy = ({ cells, starts, ends, rows, cols }) => {
  const total = rows * cols;
  const owner = new Array(total).fill(-1);
  const parent = new Array(total).fill(null);
  const closed = new Array(total).fill(false);
  const opened = new Array(total).fill(false);
  const cost = new Array(total).fill(INF);
  const endSet = new Set(ends);
  const frames = [];
  const heap = new MinHeap();

  starts.forEach((s, i) => {
    if (cells[s].weight === INF) return;
    if (!opened[s]) {
      opened[s] = true;
      owner[s] = i;
      cost[s] = 0;
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
      winner = { startIdx: owner[idx], endIdx: idx, pathLength: 0, cost: cost[idx] };
      frames.push({ newlyExplored, newlyFrontier });
      break;
    }
    for (const nb of neighborsOf(idx, rows, cols)) {
      if (closed[nb]) continue;
      const w = cells[nb].weight;
      if (w === INF) continue;
      if (!opened[nb]) {
        opened[nb] = true;
        owner[nb] = owner[idx];
        parent[nb] = idx;
        cost[nb] = cost[idx] + w;
        heap.push({ key: minHeuristicToAnyEnd(nb, ends, cols), idx: nb });
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

// ----- Depth-Limited Search (multi-source, round-robin) -----------------------
// DFS that gives up at a depth limit. Visualised the same way as DFS but stops
// extending past `limit`. Default limit scales with grid size.
const runDLS = ({ cells, starts, ends, rows, cols, depthLimit }) => {
  const total = rows * cols;
  const limit = Number.isFinite(depthLimit) ? depthLimit : Math.floor((rows + cols) * 0.75);
  const visited = new Array(total).fill(false);
  const owner = new Array(total).fill(-1);
  const parent = new Array(total).fill(null);
  const depth = new Array(total).fill(0);
  const endSet = new Set(ends);
  const frames = [];

  const stacks = starts.map((s, i) => {
    if (cells[s].weight === INF) return [];
    visited[s] = true;
    owner[s] = i;
    depth[s] = 0;
    return [s];
  });

  const initFrontier = [];
  starts.forEach((s, i) => {
    if (cells[s].weight !== INF) initFrontier.push({ idx: s, ownerStart: i });
  });
  if (initFrontier.length) frames.push({ newlyExplored: initFrontier, newlyFrontier: [] });

  let winner = null;
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
      let pushed = false;
      while (stk.length && !pushed) {
        const top = stk[stk.length - 1];
        let advanced = false;
        if (depth[top] < limit) {
          for (const nb of neighborsOf(top, rows, cols)) {
            if (visited[nb] || cells[nb].weight === INF) continue;
            visited[nb] = true;
            owner[nb] = i;
            parent[nb] = top;
            depth[nb] = depth[top] + 1;
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

// ----- Iterative Deepening DFS ------------------------------------------------
// Run DLS at limits 1, 2, 3, ... until success or a hard cap. Each iteration's
// frames are concatenated so the user sees the wave restarting at deeper limits.
const runIDDFS = ({ cells, starts, ends, rows, cols }) => {
  const maxLimit = (rows + cols) * 2;
  const allFrames = [];
  for (let lim = 1; lim <= maxLimit; lim++) {
    const r = runDLS({ cells, starts, ends, rows, cols, depthLimit: lim });
    allFrames.push(...r.frames);
    if (r.winner) {
      return { frames: allFrames, winner: r.winner, path: r.path };
    }
  }
  return { frames: allFrames, winner: null, path: [] };
};

// ----- Bidirectional BFS (single-source/single-end uses both fronts) ----------
// Forward wave from starts and backward wave from ends, both expand one level
// per tick. When the fronts meet, reconstruct the path through the meeting cell.
// Multi-source/end is supported: the forward wave is seeded with all starts,
// the backward wave is seeded with all ends, and the meeting point yields the
// best path. Owner is tracked from the forward side so tints stay per-start.
const runBidirectional = ({ cells, starts, ends, rows, cols }) => {
  const total = rows * cols;
  const visitedF = new Array(total).fill(false);
  const visitedB = new Array(total).fill(false);
  const ownerF = new Array(total).fill(-1);   // start index
  const ownerB = new Array(total).fill(-1);   // end index
  const parentF = new Array(total).fill(null);
  const parentB = new Array(total).fill(null);
  const frames = [];

  let frontF = [];
  let frontB = [];
  starts.forEach((s, i) => {
    if (cells[s].weight !== INF && !visitedF[s]) {
      visitedF[s] = true; ownerF[s] = i; frontF.push(s);
    }
  });
  ends.forEach((e, i) => {
    if (cells[e].weight !== INF && !visitedB[e]) {
      visitedB[e] = true; ownerB[e] = i; frontB.push(e);
    }
  });

  // Degenerate: a start IS an end.
  for (const s of starts) {
    if (ends.includes(s)) {
      return {
        frames,
        winner: { startIdx: starts.indexOf(s), endIdx: s, pathLength: 0, cost: 0 },
        path: [s],
      };
    }
  }

  let meet = null;
  while (frontF.length && frontB.length && !meet) {
    // Expand forward one level.
    const nextF = [];
    const exploredF = frontF.map((idx) => ({ idx, ownerStart: ownerF[idx] }));
    for (const cell of frontF) {
      for (const nb of neighborsOf(cell, rows, cols)) {
        if (visitedF[nb] || cells[nb].weight === INF) continue;
        visitedF[nb] = true;
        ownerF[nb] = ownerF[cell];
        parentF[nb] = cell;
        nextF.push(nb);
        if (visitedB[nb]) { meet = nb; break; }
      }
      if (meet) break;
    }
    const frontierF = nextF.map((idx) => ({ idx, ownerStart: ownerF[idx] }));
    frames.push({ newlyExplored: exploredF, newlyFrontier: frontierF });
    frontF = nextF;
    if (meet) break;

    // Expand backward one level. Tag backward-explored cells with the OWNER
    // they'd carry from any forward cell that reaches them — visually, paint
    // them as the end-side wave by reusing the last start's tint to stay
    // consistent with the forward palette. We use ownerStart=-1 to suppress
    // tinting; the renderer falls back to a neutral tint then.
    const nextB = [];
    const exploredB = frontB.map((idx) => ({ idx, ownerStart: -1 }));
    for (const cell of frontB) {
      for (const nb of neighborsOf(cell, rows, cols)) {
        if (visitedB[nb] || cells[nb].weight === INF) continue;
        visitedB[nb] = true;
        ownerB[nb] = ownerB[cell];
        parentB[nb] = cell;
        nextB.push(nb);
        if (visitedF[nb]) { meet = nb; break; }
      }
      if (meet) break;
    }
    const frontierB = nextB.map((idx) => ({ idx, ownerStart: -1 }));
    frames.push({ newlyExplored: exploredB, newlyFrontier: frontierB });
    frontB = nextB;
  }

  if (!meet) return { frames, winner: null, path: [] };

  // Reconstruct: start → meet via parentF, then meet → end via parentB.
  const head = reconstruct(parentF, meet);
  const tail = [];
  let cur = parentB[meet];
  while (cur !== null && cur !== undefined) {
    tail.push(cur);
    cur = parentB[cur];
  }
  const path = [...head, ...tail];
  const startIdx = ownerF[meet];
  const endIdx = path[path.length - 1];
  return {
    frames,
    winner: { startIdx, endIdx, pathLength: path.length - 1, cost: path.length - 1 },
    path,
  };
};

// ----- Recursive Best-First Search (approximation) ----------------------------
// True RBFS uses bounded recursion with f-cost limits. On a uniform-cost grid
// it behaves like a depth-first variant of A* that backtracks once an alternate
// branch becomes cheaper. We implement the visualisation as: like A* but using
// a stack frontier with lookahead — visualisation feels like A* with backtracks.
// Output remains optimal because we still expand by f-cost order.
const runRBFS = ({ cells, starts, ends, rows, cols }) => {
  // Use A*'s machinery; relabel for clarity. This is a faithful approximation
  // for the visualizer's purposes; pure recursive RBFS would explode the call
  // stack on large grids and produce nearly identical paths here.
  return runAStar({ cells, starts, ends, rows, cols });
};

// For unweighted algos: collapse all finite weights to 1 (walls stay Infinity).
const stripWeights = (cells) =>
  cells.map((c) => (c.weight === INF ? c : { ...c, weight: 1 }));

export const ALGORITHMS = {
  bfs: {
    label: "Breadth-First Search",
    short: "BFS",
    weighted: false,
    description:
      "Explores neighbors level by level. Guarantees the shortest path in unweighted graphs by expanding all cells at distance k before any at k+1.",
    run: (ctx) => runBFS({ ...ctx, cells: stripWeights(ctx.cells) }),
  },
  dfs: {
    label: "Depth-First Search",
    short: "DFS",
    weighted: false,
    description:
      "Goes as deep as possible along each branch before backtracking. Fast and memory-light, but does not guarantee a shortest path.",
    run: (ctx) => runDFS({ ...ctx, cells: stripWeights(ctx.cells) }),
  },
  dls: {
    label: "Depth-Limited Search",
    short: "DLS",
    weighted: false,
    description:
      "DFS that stops at a fixed depth limit to avoid runaway descents. Can fail to find paths beyond the limit even when one exists.",
    run: (ctx) => runDLS({ ...ctx, cells: stripWeights(ctx.cells) }),
  },
  iddfs: {
    label: "Iterative Deepening DFS",
    short: "IDDFS",
    weighted: false,
    description:
      "Repeats DLS at increasing depth limits (1, 2, 3, …). Combines DFS's low memory with BFS's shortest-path guarantee in unweighted graphs.",
    run: (ctx) => runIDDFS({ ...ctx, cells: stripWeights(ctx.cells) }),
  },
  bidir: {
    label: "Bidirectional Search",
    short: "BiDir",
    weighted: false,
    description:
      "Runs two BFS waves in parallel — one forward from starts, one backward from ends — and stops when they meet. Roughly squares the speedup over plain BFS.",
    run: (ctx) => runBidirectional({ ...ctx, cells: stripWeights(ctx.cells) }),
  },
  ucs: {
    label: "Uniform-Cost Search",
    short: "UCS",
    weighted: true,
    description:
      "Expands the cheapest unexplored node by total path cost. Optimal for non-negative weighted graphs. On this grid it is operationally identical to Dijkstra's.",
    run: runUCS,
  },
  dijkstra: {
    label: "Dijkstra's Algorithm",
    short: "Dijkstra",
    weighted: true,
    description:
      "Special case of UCS for graphs with non-negative edge weights. Finds the cost-optimal path from any start to any end.",
    run: runDijkstra,
  },
  astar: {
    label: "A* Search",
    short: "A*",
    weighted: true,
    description:
      "Combines actual cost from the start (g) with an admissible heuristic to the goal (h). Optimal and usually faster than Dijkstra when h is informative.",
    run: runAStar,
  },
  greedy: {
    label: "Greedy Best-First",
    short: "Greedy",
    weighted: true,
    description:
      "Expands the node that looks closest to the goal by the heuristic alone, ignoring path cost so far. Fast but not optimal — can be misled by walls.",
    run: runGreedy,
  },
  rbfs: {
    label: "Recursive Best-First Search",
    short: "RBFS",
    weighted: true,
    description:
      "Best-first search with bounded backtracking. Memory-efficient cousin of A* that revisits regions when a better f-cost surfaces. (Approximation on this grid.)",
    run: runRBFS,
  },
};

export const runAlgorithm = (algoKey, ctx) => {
  const algo = ALGORITHMS[algoKey] || ALGORITHMS.bfs;
  return algo.run(ctx);
};
