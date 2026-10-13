import { useReducer, useState, useEffect, useRef } from 'react';
import { 
  GameState, 
  Score, 
  initialGameState, 
  initialScore, 
  applyMove, 
  togglePlayer 
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
    if (currentState.winner !== null && currentState.winner !== prevState.winner) {
      setScore(prev => ({
        ...prev,
        [currentState.winner.toLowerCase() as 'x' | 'o']: prev[currentState.winner.toLowerCase() as 'x' | 'o'] + 1
      }));
    }
    
    // Update the ref
    prevStateRef.current = currentState;
  }, [state.winner, score]);

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