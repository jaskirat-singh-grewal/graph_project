// Single source of truth for what a cell is and how the wall palette works.
//
// Cell shape (one entry per grid position):
//   {
//     terrainId: string | null,   // null = empty; otherwise references wallTypes[id]
//     weight:    number,          // 1 for empty; wallType.weight for terrain (Infinity = hard wall)
//   }
//
// Start/end positions are tracked separately as arrays of cell indices, not
// stamped onto the cells themselves — that keeps placement and erasure trivial.

export const INF = Infinity;

// Built-in wall: classic impassable. Always present, can't be deleted.
export const HARD_WALL_ID = "hard_wall";

export const DEFAULT_WALL_TYPES = [
  { id: HARD_WALL_ID, name: "Hard Wall", color: "#3a1f55", weight: INF, builtin: true },
  { id: "mud", name: "Mud", color: "#b97a2c", weight: 5, builtin: false },
  { id: "swamp", name: "Swamp", color: "#2c8a6b", weight: 10, builtin: false },
];

// Per-start tint palette. Cycled if the user adds more starts than colors.
// Picked to read clearly on the dark navy base.
export const START_TINTS = [
  "#ff7e5f", // coral
  "#41ead4", // teal
  "#fbb13c", // amber
  "#a06cd5", // violet
  "#73d13d", // lime
  "#ff5d8f", // pink
];

export const tintForStart = (i) =>
  i == null || i < 0 ? null : START_TINTS[i % START_TINTS.length];

export const makeEmptyCells = (rows, cols) =>
  Array(rows * cols).fill(0).map(() => ({ terrainId: null, weight: 1 }));

export const cellIsWalkable = (cell) => cell.weight !== INF;

// Generate a stable-ish id for new wall types the user creates.
let counter = 0;
export const newWallTypeId = () => `wt_${Date.now().toString(36)}_${counter++}`;
