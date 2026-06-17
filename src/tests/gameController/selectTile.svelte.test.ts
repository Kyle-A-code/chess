import { describe, test, expect, beforeEach } from 'vitest';
import { gameState, resetGame, selectTile } from '../../lib/game/gameController.svelte';

describe('When selecting a tile', () => {
	beforeEach(() => {
		resetGame();
	});
	describe('Given no tile is currently selected', () => {
		test('Then selecting a tile without a piece should do nothing', () => {
			gameState.boardState = {};
			selectTile('a1');
			expect(gameState.selectedTileId).toBeUndefined();
		});

		test('Then selecting a tile with a piece from the same side should set the selected tile id', () => {
			gameState.boardState = {
				a1: { type: 'pawn', side: 'light' }
			};
			selectTile('a1');
			expect(gameState.selectedTileId).toBe('a1');
		});

		test('Then selecting a tile from the opposite side should do nothing', () => {
			gameState.boardState = {
				a1: { type: 'pawn', side: 'dark' }
			};
			selectTile('a1');
			expect(gameState.selectedTileId).toBeUndefined();
		});
	});
	describe('Given a tile is currently selected', () => {
		beforeEach(() => {
			gameState.boardState = { a1: { type: 'pawn', side: 'light' } };
			gameState.selectedTileId = 'a1';
		});
		test('Then selecting the same tile should deselect the tile', () => {
			selectTile('a1');
			expect(gameState.selectedTileId).toBeUndefined();
		});
		describe('Given selecting any other tile', () => {
			beforeEach(() => {
				selectTile('a2');
			});
			test('Then selecting a different tile should move the piece to the new tile', () => {
				expect(gameState.boardState['a1']).toBeUndefined();
				expect(gameState.boardState['a2']).toEqual({ type: 'pawn', side: 'light' });
			});
			test('Then selecting a different tile should clear the selection', () => {
				expect(gameState.selectedTileId).toBeUndefined();
			});
			test('Then selecting a different tile should advance the turn to the dark side', () => {
				expect(gameState.currentTurn).toBe(2);
				expect(gameState.activeSide).toBe('dark');
			});
		});
		describe('Given selecting a tile with a piece from the same side', () => {
			test('Then nothing should happen', () => {
				gameState.boardState['a2'] = { type: 'pawn', side: 'light' };
				selectTile('a2');
				expect(gameState.selectedTileId).toBe('a1');
				expect(gameState.boardState['a1']).toEqual({ type: 'pawn', side: 'light' });
				expect(gameState.boardState['a2']).toEqual({ type: 'pawn', side: 'light' });
				expect(gameState.currentTurn).toBe(1);
				expect(gameState.activeSide).toBe('light');
			});
		});
		test.todo('Test legal moves once implemented');
	});
});
