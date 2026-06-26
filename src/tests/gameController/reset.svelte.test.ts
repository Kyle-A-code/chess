import { describe, test, expect } from 'vitest';
import { gameState, resetGame } from '../../lib/game/gameController.svelte';
import { START_BOARD_STATE } from '../fixtures/boardStates';

describe('When resetting the game', () => {
	test('Then the game should be reset to the initial state', () => {
		resetGame();
		expect(gameState.selectedTileId).toBeUndefined();
		expect(gameState.boardState).toEqual(START_BOARD_STATE);
	});
});
