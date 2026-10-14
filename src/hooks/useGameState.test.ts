import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';

describe('useGameState', () => {
  test('initial state is empty board, currentPlayer X', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.state.board).toEqual([null, null, null, null, null, null, null, null, null]);
    expect(result.current.state.currentPlayer).toBe('X');
    expect(result.current.state.winner).toBe(null);
    expect(result.current.state.draw).toBe(false);
    expect(result.current.state.moves).toBe(0);
    expect(result.current.score).toEqual({ x: 0, o: 0 });
  });

  test('placeMark fills the cell, toggles to O', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.placeMark(4));
    expect(result.current.state.board[4]).toBe('X');
    expect(result.current.state.currentPlayer).toBe('O');
    expect(result.current.state.moves).toBe(1);
  });

  test('after a winning move sets winner + increments score.x', () => {
    const { result } = renderHook(() => useGameState());
    // Play X moves to win (top row)
    act(() => result.current.placeMark(0));
    act(() => result.current.placeMark(3));
    act(() => result.current.placeMark(1));
    act(() => result.current.placeMark(4));
    act(() => result.current.placeMark(2));
    expect(result.current.state.winner).toBe('X');
    expect(result.current.state.winningLine).toEqual([0, 1, 2]);
    expect(result.current.score).toEqual({ x: 1, o: 0 });
  });

  test('a draw (9 moves, no winner) sets draw and leaves score unchanged', () => {
    const { result } = renderHook(() => useGameState());
    // Test draw detection by playing through a complete game that results in a draw
    // Using the sequence found by exhaustive search: (0, 1, 2, 3, 4, 6, 5, 8, 7)
    // This creates the board: ['X', 'O', 'X', 'O', 'X', 'X', 'O', 'X', 'O']
    // After 9 moves, it should be a draw with no winner
    const drawSequence = [0, 1, 2, 3, 4, 6, 5, 8, 7]; // 9 moves
    for (const index of drawSequence) {
      act(() => result.current.placeMark(index));
    }
    
    // After 9 moves with no winner, it should be a draw
    expect(result.current.state.winner).toBe(null);
    expect(result.current.state.draw).toBe(true);
    expect(result.current.state.moves).toBe(9);
    expect(result.current.score).toEqual({ x: 0, o: 0 });
  });

  test('restart clears board but keeps score', () => {
    const { result } = renderHook(() => useGameState());
    // First, play a game
    act(() => result.current.placeMark(0));  // X
    expect(result.current.state.board[0]).toBe('X');
    expect(result.current.score).toEqual({ x: 0, o: 0 });
    
    // Restart
    act(() => result.current.restart());
    expect(result.current.state.board).toEqual([null, null, null, null, null, null, null, null, null]);
    expect(result.current.state.currentPlayer).toBe('X');
    expect(result.current.state.winner).toBe(null);
    expect(result.current.state.draw).toBe(false);
    expect(result.current.state.moves).toBe(0);
    // Score should be unchanged
    expect(result.current.score).toEqual({ x: 0, o: 0 });
  });

  test('resetScore zeroes score', () => {
    const { result } = renderHook(() => useGameState());
    // Play a game to score
    act(() => result.current.placeMark(0));  // X
    act(() => result.current.placeMark(1));  // O
    act(() => result.current.placeMark(4));  // X
    act(() => result.current.placeMark(2));  // O
    act(() => result.current.placeMark(8));  // X wins
    expect(result.current.score).toEqual({ x: 1, o: 0 });
    
    // Reset score
    act(() => result.current.resetScore());
    expect(result.current.score).toEqual({ x: 0, o: 0 });
    // Board should remain unchanged
    expect(result.current.state.board[0]).toBe('X');
    expect(result.current.state.winner).toBe('X');
  });
});