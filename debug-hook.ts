import { renderHook, act } from '@testing-library/react';
import { useGameState } from './src/hooks/useGameState.ts';

console.log('Testing useGameState hook...');

const { result } = renderHook(() => useGameState());

console.log('Initial state:', result.current.state);
console.log('Initial score:', result.current.score);

// Test 1: placeMark with empty cell
console.log('\n--- Test 1: placeMark with index 0 ---');
act(() => result.current.placeMark(0));
console.log('State after placeMark(0):', result.current.state);
console.log('Score after placeMark(0):', result.current.score);

// Test 2: placeMark with occupied cell
console.log('\n--- Test 2: placeMark with occupied index 0 ---');
act(() => result.current.placeMark(0));
console.log('State after second placeMark(0):', result.current.state);
console.log('Score after second placeMark(0):', result.current.score);

// Test 3: resetScore
console.log('\n--- Test 3: resetScore ---');
act(() => result.current.resetScore());
console.log('State after resetScore:', result.current.state);
console.log('Score after resetScore:', result.current.score);