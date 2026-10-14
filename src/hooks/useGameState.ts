import { useReducer, useState, useEffect, useRef } from 'react';
import { 
  GameState, 
  Score, 
  initialGameState, 
  initialScore, 
  applyMove
} from '../lib/game';

export interface UseGameState {
  state: GameState;
  score: Score;
  placeMark: (index: number) => void;
  restart: () => void;
  resetScore: () => void;
}

export type GameAction = 
  | { type: 'place'; index: number }
  | { type: 'restart' }
  | { type: 'resetScore' };

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'place':
      return applyMove(state, action.index);
    case 'restart':
      return initialGameState();
    case 'resetScore':
      return state;
    default:
      return state;
  }
}

export function useGameState(): UseGameState {
  const [state, dispatch] = useReducer(reducer, initialGameState());
  const [score, setScore] = useState(initialScore());
  const prevStateRef = useRef<GameState>(initialGameState());

  // Update score when state changes
  useEffect(() => {
    const prevState = prevStateRef.current;
    const currentState = state;
    
    // Check if winner changed
    const winner = currentState.winner;
    if (winner !== null && winner !== prevState.winner) {
      const key = winner.toLowerCase() as 'x' | 'o';
      setScore(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
    
    // Update the ref
    prevStateRef.current = currentState;
  }, [state]);

  const placeMark = (index: number) => {
    if (state.board[index] === null) {
      dispatch({ type: 'place', index });
    }
  };

  const restart = () => {
    dispatch({ type: 'restart' });
  };

  const resetScore = () => {
    setScore(initialScore());
  };

  return {
    state,
    score,
    placeMark,
    restart,
    resetScore,
  };
}