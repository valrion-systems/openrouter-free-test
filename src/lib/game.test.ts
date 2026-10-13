import { describe, test, expect } from 'vitest';
import { 
  Player, Cell, Board, GameState, Score, 
  WINNING_LINES, initialGameState, initialScore, 
  togglePlayer, checkWinner, isBoardFull, applyMove 
} from './game';

describe('Game Logic', () => {
  describe('togglePlayer', () => {
    test('toggles X to O', () => {
      expect(togglePlayer('X')).toBe('O');
    });

    test('toggles O to X', () => {
      expect(togglePlayer('O')).toBe('X');
    });
  });

  describe('checkWinner', () => {
    test('returns null when no winner on empty board', () => {
      const board: Board = [null, null, null, null, null, null, null, null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe(null);
      expect(result.line).toBe(null);
    });

    test('detects X win on first row', () => {
      const board: Board = ['X', 'X', 'X', null, null, null, null, null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe('X');
      expect(result.line).toEqual([0, 1, 2]);
    });

    test('detects O win on first column', () => {
      const board: Board = ['O', null, null, 'O', null, null, 'O', null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe('O');
      expect(result.line).toEqual([0, 3, 6]);
    });

    test('detects X win on diagonal', () => {
      const board: Board = ['X', null, null, null, 'X', null, null, null, 'X'];
      const result = checkWinner(board);
      expect(result.winner).toBe('X');
      expect(result.line).toEqual([0, 4, 8]);
    });

    test('detects O win on other diagonal', () => {
      const board: Board = [null, null, 'O', null, 'O', null, 'O', null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe('O');
      expect(result.line).toEqual([2, 4, 6]);
    });

    test('no winner when X and O different', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', null, null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe(null);
      expect(result.line).toBe(null);
    });

    test('checks all winning lines', () => {
      for (const line of WINNING_LINES) {
        const board: Board = [null, null, null, null, null, null, null, null, null];
        const [a, b, c] = line;
        board[a] = 'X';
        board[b] = 'X';
        board[c] = 'X';
        
        const result = checkWinner(board);
        expect(result.winner).toBe('X');
        expect(result.line).toEqual(line);
      }
    });
  });

  describe('isBoardFull', () => {
    test('returns true when board is full', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      expect(isBoardFull(board)).toBe(true);
    });

    test('returns false when board has empty cells', () => {
      const board: Board = ['X', 'O', null, 'O', 'X', null, 'X', 'O', null];
      expect(isBoardFull(board)).toBe(false);
    });

    test('returns true on empty board', () => {
      const board: Board = [null, null, null, null, null, null, null, null, null];
      expect(isBoardFull(board)).toBe(false);
    });
  });

  describe('applyMove', () => {
    test('places X on empty cell', () => {
      const state = initialGameState();
      const result = applyMove(state, 4);
      expect(result.board[4]).toBe('X');
      expect(result.currentPlayer).toBe('O');
      expect(result.moves).toBe(1);
      expect(result.winner).toBe(null);
      expect(result.draw).toBe(false);
    });

    test('places O on empty cell', () => {
      const state: GameState = {
        board: [null, 'X', null, null, null, null, null, null, null],
        currentPlayer: 'O',
        winner: null,
        winningLine: null,
        moves: 1,
        draw: false
      };
      const result = applyMove(state, 0);
      expect(result.board[0]).toBe('O');
      expect(result.currentPlayer).toBe('X');
      expect(result.moves).toBe(2);
    });

    test('no-op on occupied cell', () => {
      const state = applyMove(initialGameState(), 0);
      const result = applyMove(state, 0);
      expect(result).toBe(state); // Should be the same state object
      expect(result.moves).toBe(1);
    });

    test('no-op when game already won', () => {
      const board: Board = ['X', 'X', 'X', null, null, null, null, null, null];
      const state: GameState = {
        board,
        currentPlayer: 'O',
        winner: null,
        winningLine: null,
        moves: 0,
        draw: false
      };
      const result = applyMove(state, 4);
      expect(result).toBe(state); // Should be the same state object
    });

    test('detects win after move', () => {
      const state: GameState = {
        board: ['X', 'X', null, 'O', 'O', null, null, null, null],
        currentPlayer: 'X',
        winner: null,
        winningLine: null,
        moves: 5,
        draw: false
      };
      const result = applyMove(state, 2);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 1, 2]);
      expect(result.currentPlayer).toBe('O');
    });

    test('detects draw on 9th move with no winner', () => {
      const board: Board = ['O', 'X', 'O', 'O', 'X', 'X', null, 'O', 'X'];
      const state: GameState = {
        board,
        currentPlayer: 'X',
        winner: null,
        winningLine: null,
        moves: 8,
        draw: false
      };
      const result = applyMove(state, 6);
      expect(result.winner).toBe(null);
      expect(result.draw).toBe(true);
      expect(result.moves).toBe(9);
    });

    test('draw only when no winner and board is full', () => {
      const board: Board = ['O', 'X', 'O', 'O', 'X', 'X', null, 'O', 'X'];
      const state: GameState = {
        board,
        currentPlayer: 'X',
        winner: null,
        winningLine: null,
        moves: 8,
        draw: false
      };
      const result = applyMove(state, 6);
      expect(result.draw).toBe(true);
      
      // Test that draw cannot coexist with winner
      const boardWithWinner: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      const stateWithWinner: GameState = {
        board: boardWithWinner,
        currentPlayer: 'X',
        winner: 'X',
        winningLine: [0, 1, 2],
        moves: 5,
        draw: false
      };
      const resultWithWinner = applyMove(stateWithWinner, 6);
      expect(resultWithWinner.draw).toBe(false);
      expect(resultWithWinner.winner).toBe('X');
    });
  });

  describe('initialGameState', () => {
    test('returns empty board with X as current player', () => {
      const state = initialGameState();
      expect(state.board).toEqual([null, null, null, null, null, null, null, null, null]);
      expect(state.currentPlayer).toBe('X');
      expect(state.winner).toBe(null);
      expect(state.winningLine).toBe(null);
      expect(state.moves).toBe(0);
      expect(state.draw).toBe(false);
    });
  });

  describe('initialScore', () => {
    test('returns zero score for both players', () => {
      const score = initialScore();
      expect(score.x).toBe(0);
      expect(score.o).toBe(0);
    });
  });
});