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

export interface Score {
  x: number;
  o: number;
}

export const WINNING_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]              // diagonals
];

export function initialGameState(): GameState {
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    moves: 0,
    draw: false
  };
}

export function initialScore(): Score {
  return { x: 0, o: 0 };
}

export function togglePlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

export function checkWinner(board: Board): { winner: Player | null; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== null);
}

export function applyMove(state: GameState, index: number): GameState {
  // If cell is already occupied, return the same state (no-op)
  if (state.board[index] !== null) {
    return state;
  }

  // If game is already over (won or draw), return the same state (no-op)
  if (state.winner !== null || state.draw) {
    return state;
  }

  // Check if the current board already has a winner
  const currentWinner = checkWinner(state.board);
  if (currentWinner.winner !== null) {
    return state;
  }

  const newBoard = [...state.board] as Board;
  newBoard[index] = state.currentPlayer;
  
  const { winner, line } = checkWinner(newBoard);
  const moves = state.moves + 1;
  const draw = !winner && isBoardFull(newBoard);

  return {
    ...state,
    board: newBoard,
    currentPlayer: togglePlayer(state.currentPlayer),
    winner,
    winningLine: line,
    moves,
    draw
  };
}