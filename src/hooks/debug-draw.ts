import { renderHook, act } from '@testing-library/react';
import { useGameState } from './src/hooks/useGameState';

const { result } = renderHook(() => useGameState());

console.log('Initial board:', result.current.state.board);

// Test draw sequence
const drawSequence = [0, 1, 2, 3, 4, 5, 7, 8, 6];
for (let i = 0; i < drawSequence.length; i++) {
  const index = drawSequence[i];
  act(() => result.current.placeMark(index));
  console.log(`Move ${i+1} (index ${index}):`, result.current.state.board);
}

console.log('\nFinal state:');
console.log('Board:', result.current.state.board);
console.log('Winner:', result.current.state.winner);
console.log('Draw:', result.current.state.draw);
console.log('Moves:', result.current.state.moves);

// Check for winner manually
const board = result.current.state.board;
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]              // diagonals
];

console.log('\nChecking for winner:');
for (const line of WINNING_LINES) {
  const [a, b, c] = line;
  if (board[a] && board[a] === board[b] && board[a] === board[c]) {
    console.log(`WINNER: line ${line} with ${board[a]}`);
  }
}

// Check if board is full
const isBoardFull = board.every(cell => cell !== null);
console.log('\nIs board full:', isBoardFull);