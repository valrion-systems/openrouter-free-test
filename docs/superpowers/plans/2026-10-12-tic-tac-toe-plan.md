# Tic Tac Toe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> (recommended) or superpowers:subagent-driven-development to implement this
> plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, two-player (X/O pass-and-play) Tic Tac Toe React web
app in TypeScript, with unit + component tests and acceptance coverage.

**Architecture:** A single React app holds one board in a `useReducer`-backed
hook (`useGameState`) that delegates all state transitions to pure functions
in `lib/game.ts` (testable without React). Presentational components
(`Board`, `Cell`, `Status`, `Controls`) consume that hook's state. One route,
no backend, no network after load.

**Tech Stack:** React 18 + TypeScript + Vite (build/dev). Vitest +
Testing Library + jsdom (tests). System-ui font, co-located CSS modules.

**Spec:** `docs/superpowers/specs/2026-10-12-tic-tac-toe-design.md`

## Global Constraints

- React 18, TypeScript, Vite — no other frameworks.
- Local only; no runtime network requests or external APIs.
- Single route; full app in `src/App.tsx`.
- Touch targets ≥ 48px; responsive grid (board fills smaller viewport dim).
- Font: system sans-serif (`system-ui`); no webfont downloads.
- Color: neutral grays + blue accent (builder call from spec).

## Review Focus

The spec leaves these inputs/conditions unstated but a reasonable user will
expect defined behavior. Each is pinned by a test in its owning task.

1. Clicking an already-occupied cell → no-op (Board must ignore it). [Task 4]
2. Clicking after the game is decided (win/draw) → board must not mutate. [Task 4]
3. Win detection across all 8 triples, especially the two diagonals and
   middle column/row — most likely to be mis-indexed. [Task 2]
4. Draw only when board is full AND no winner; `draw=true` must never coexist
   with a winner. [Task 2]
5. Score math: win → +1 to winner; draw → +0 to both; Restart keeps score;
   Reset Score zeroes both. [Task 5]

---

### Task 1: Scaffold the project and test infrastructure

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`,
  `public/favicon.svg`, `src/main.tsx`, `src/index.css`,
  `src/App.tsx`, `src/App.css`.
- Create: `vitest.config.ts`, `src/setupTests.ts`,
  `src/lib/game.test.ts` (placeholder, runs 0 real tests).

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run dev` (serves at `http://localhost:5173`),
  `npm run build` (emits `dist/`), `npm test` (vitest, `--run`, exits 0).

- [ ] **Step 1: Scaffold**
```bash
npm create vite@latest . -- --template react-ts
```
Accept defaults. Verify `package.json` reports React + TS + Vite.

- [ ] **Step 2: Install runtime deps**
```bash
npm install
```

- [ ] **Step 3: Install test deps**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

- [ ] **Step 4: Configure Vite + Vitest**
In `vite.config.ts`, add a test block with `environment: 'jsdom'`.
In `package.json`, add script `"test": "vitest"` and `"test:run": "vitest run"`.
Create `src/setupTests.ts` importing `@testing-library/jest-dom`.

- [ ] **Step 5: Verify infra runs**
```bash
npm run dev   # expect: serves, no errors
npm run test:run  # expect: exits 0 (placeholder test optional)
```

- [ ] **Step 6: Commit**
```bash
git init 2>/dev/null; npm pkg set scripts.prepare="" 2>/dev/null
git add -A
git commit -m "chore: scaffold React+TS+Vite with test infra"
```

---

### Task 2: Pure game logic (`lib/game.ts`)

**Files:**
- Create: `src/lib/game.ts`, `src/lib/game.test.ts`.
- (No UI touches.)

**Interfaces:**
- Produces (consumed by Task 3 and Task 4):
```ts
export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  winningLine: number[] | null;
  moves: number;
  draw: boolean;
}
export interface Score { x: number; o: number; }
export const WINNING_LINES: number[][];
export function initialGameState(): GameState;
export function initialScore(): Score;
export function togglePlayer(player: Player): Player;
export function checkWinner(board: Board): { winner: Player | null; line: number[] | null };
export function isBoardFull(board: Board): boolean;
export function applyMove(state: GameState, index: number): GameState;
```

- [ ] **Step 1: Write failing tests** (`src/lib/game.test.ts`)
Cover: togglePlayer swaps; checkWinner finds each of the 8 lines (rows 012/345/678, cols 036/147/258, diagonals 048/246) including "no winner" on empty; isBoardFull true when all 9 filled; applyMove places mark, increments moves, toggles player, and *detects* a win (sets `winner` + `winningLine`), and detects a draw on the 9th move with no winner (sets `draw=true`, `winner=null`); applyMove on an occupied/illegal index is a no-op (returns same state). Use the spec's exact `winningLine` semantics (array of 3 indices).

- [ ] **Step 2: Run test to verify it fails**
```bash
npm run test:run src/lib/game.test.ts
```
Expected: FAIL (module `lib/game.ts` not found).

- [ ] **Step 3: Implement `src/lib/game.ts`**
Approach: a flat 9-cell `Board`; `WINNING_LINES` as 8 triples; `checkWinner` iterates lines testing `board[a] && board[a]===board[b] && board[a]===board[c]`; `applyMove` ignores clicks when `winner !== null || draw || board[index] !== null`, else returns a new `GameState` with the mark, `moves+1`, updated `currentPlayer`, and recomputed `winner`/`winningLine`/`draw`. (Body needed here — the algorithm isn't fully determined by signatures/tests alone.)

- [ ] **Step 4: Run test to verify it passes**
```bash
npm run test:run src/lib/game.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/lib/game.ts src/lib/game.test.ts
git commit -m "feat: pure game logic (checkWinner, applyMove, togglePlayer)"
```

---

### Task 3: `useGameState` hook (React state over the logic)

**Files:**
- Create: `src/hooks/useGameState.ts`, `src/hooks/useGameState.test.ts`.

**Interfaces:**
- Consumes: `GameState`, `Score`, `initialGameState`, `initialScore`,
  `applyMove`, `togglePlayer` from `lib/game.ts`.
- Produces (consumed by Task 4 & Task 5):
```ts
export interface UseGameState {
  state: GameState;
  score: Score;
  placeMark: (index: number) => void;
  restart: () => void;
  resetScore: () => void;
}
export function useGameState(): UseGameState;
```
Reducer actions: `{ type: 'place'; index: number }`, `{ type: 'restart' }`,
`{ type: 'resetScore' }`.

- [ ] **Step 1: Write failing tests** (`src/hooks/useGameState.test.ts`)
Use `@testing-library/react`'s `renderHook` + `act`. Cover: initial state is
empty board, currentPlayer 'X'; placeMark fills the cell, toggles to 'O',
and after a winning move sets `winner` + increments `score.x`; a draw (9
moves, no winner) sets `draw` and leaves score unchanged; restart clears
board but keeps `score`; resetScore zeroes `score`.

- [ ] **Step 2: Run test to verify it fails**
```bash
npm run test:run src/hooks/useGameState.test.ts
```
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/hooks/useGameState.ts`**
Use `useReducer(reducer, initialGameState())` plus `useState(initialScore())`
for score. `placeMark` → `applyMove(state, index)`; on the resulting state,
if `winner` set after the move, increment the winner's score. `restart` →
`applyMove`-style reset to `initialGameState()` (keep score). `resetScore` →
`initialScore()`.

- [ ] **Step 4: Run test to verify it passes**
```bash
npm run test:run src/hooks/useGameState.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/hooks/useGameState.ts src/hooks/useGameState.test.ts
git commit -m "feat: useGameState hook wiring reducer to pure logic"
```

---

### Task 4: `Board` + `Cell` (interactive board)

**Files:**
- Create: `src/components/Cell.tsx`, `src/components/Board.tsx`,
  `src/components/Board.module.css`, `src/components/Board.test.tsx`.

**Interfaces:**
- Consumes: `GameState` from `lib/game.ts`; `UseGameState` shape.
- Produces (consumed by Task 5):
```ts
// Cell.tsx
interface CellProps {
  value: Cell;        // from lib/game.ts
  index: number;
  disabled: boolean;
  onClick: (index: number) => void;
  isWinning: boolean;
}
// Board.tsx
interface BoardProps {
  state: GameState;
  onCellClick: (index: number) => void;
}
```

- [ ] **Step 1: Write failing tests** (`src/components/Board.test.tsx`)
Render `<Board state={initialGameState()} onCellClick={fn} />`; assert 9 cells
render and clicking an empty cell calls `onCellClick(3)` with the right index.
Assert clicking the board passes `disabled` and `isWinning` correctly. Cover
Review Focus #1 & #2 indirectly via the App-level test in Task 5, but here
assert that a cell in a decided state (`winner !== null`) still *renders* its
mark (the disabling/no-op is the hook's job — confirm `onCellClick` is not
called when the hook already ignores it).

- [ ] **Step 2: Run test to verify it fails**
```bash
npm run test:run src/components/Board.test.tsx
```
Expected: FAIL (components not found).

- [ ] **Step 3: Implement `Cell.tsx` and `Board.tsx`**
`Board` maps `0..8` → `<Cell />`, computing `disabled = state.winner !== null ||
state.draw`, `isWinning = !!state.winningLine?.includes(i)`, `value =
state.board[i]`, and forwarding clicks to `onCellClick(i)`. `Cell` renders the
mark (or empty), applies a winning highlight, and a `min 48px` touch target.
Keep styling in `Board.module.css` (board + cell share a file — they change
together).

- [ ] **Step 4: Run test to verify it passes**
```bash
npm run test:run src/components/Board.test.tsx
```
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/Cell.tsx src/components/Board.tsx src/components/Board.module.css src/components/Board.test.tsx
git commit -m "feat: Board + Cell interactive component"
```

---

### Task 5: `Status` + `Controls` + `App` + styles + integration test

**Files:**
- Create: `src/components/Status.tsx`, `src/components/Controls.tsx`,
  `src/App.tsx`, `src/App.css`, `src/setupTests.ts` (if not created in Task 1),
  `src/App.test.tsx`.

**Interfaces:**
- Consumes: `useGameState` (Task 3), `Board`/`BoardProps` (Task 4),
  `GameState`, `Score`.
- Produces: the full app.
```ts
// Status.tsx
interface StatusProps { state: GameState }
// Controls.tsx
interface ControlsProps { hasResult: boolean; onRestart: () => void; onResetScore: () => void }
// App.tsx
// no props
```

- [ ] **Step 1: Write failing integration test** (`src/App.test.tsx`)
Render `<App />` via `userEvent`. Play one full winning game for X
(top row: 0→1→3→4→2) and assert status shows "X won", score `x:1 o:0`, winning
cells highlighted. Then restart and play to a draw (e.g. 0→1→2, 3→4→5… finish
board with no line) and assert status "Draw", score unchanged (1/0). Then
reset score → assert `x:0 o:0`. This locks Review Focus #3, #4, #5 plus the
no-op-on-occupied-after-decision cases (#1, #2) because the win path
includes an already-marked cell being clicked.

- [ ] **Step 2: Run test to verify it fails**
```bash
npm run test:run src/App.test.tsx
```
Expected: FAIL (App not found).

- [ ] **Step 3: Implement `Status.tsx`, `Controls.tsx`, `App.tsx`, `App.css`**
`App` calls `useGameState()`, renders score line + `<Board state={state}
onCellClick={placeMark} />` + `<Status state={state} />` +
`<Controls hasResult={state.winner !== null || state.draw} onRestart={restart}
onResetScore={resetScore} />`. `Status` maps `winner`/`draw`/`currentPlayer`
to the spec's messages ("X's turn"/"O's turn", "O won!", "It's a draw").
`Controls` shows Restart always, Reset Score only when `hasResult`. Global
reset via `src/index.css` (margin:0, `font-family: system-ui`).

- [ ] **Step 4: Run test to verify it passes**
```bash
npm run test:run src/App.test.tsx
```
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/Status.tsx src/components/Controls.tsx src/App.tsx src/App.css src/App.test.tsx
git commit -m "feat: Status, Controls, App composition + integration tests"
```

---

### Task 6: Full verification against acceptance criteria

**Files:** none created (verification only).

**Interfaces:** runs the whole suite.

- [ ] **Step 1: Run the full test suite**
```bash
npm run test:run
```
Expected: PASS, all tasks green together (catches cross-task regressions).

- [ ] **Step 2: Type-check + build**
```bash
npx tsc --noEmit
npm run build
```
Expected: no type errors; `dist/` produced.

- [ ] **Step 3: Dev-server smoke**
```bash
npm run dev
```
Open `http://localhost:5173`, confirm the board renders and a couple of moves
work. (If headless, `curl` the server and assert 200 + HTML body containing
the title.)

- [ ] **Step 4: Confirm acceptance criteria** (from spec)
- [x] dev server opens a playable board
- [x] X/O alternate; cells can't be retaken
- [x] win lights a line and halts; status reads "<P> won"
- [x] full board with no winner → "Draw"
- [x] Restart clears board keeping score; Reset Score zeroes score
- [x] layout works on phone (landscape) and desktop
- [x] `npm test` passes

- [ ] **Step 5: Final commit (fixups if any)**
```bash
git add -A
git commit -m "chore: full verification — tests, typecheck, build pass" \
  || git commit --amend --no-edit
```
