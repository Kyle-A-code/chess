import { describe, test, expect } from 'vitest';
import { gameState, INITIAL_BOARD_STATE, resetGame } from '../../lib/game/gameController.svelte';

describe('When resetting the game', () => {
	test('Then the game should be reset to the initial state', () => {
		resetGame();
		expect(gameState.currentTurn).toBe(1);
		expect(gameState.activeSide).toBe('light');
		expect(gameState.selectedTileId).toBeUndefined();
		expect(gameState.boardState).toEqual(INITIAL_BOARD_STATE);
	});
});
