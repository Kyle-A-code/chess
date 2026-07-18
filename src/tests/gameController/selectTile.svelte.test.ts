import { describe, test, expect, beforeEach } from 'vitest';
import { gameState, resetGame, selectTile } from '../../lib/game/gameController.svelte';
import type { PiecePlacement } from '../../lib/types';

const A1 = 'a1';
const A2 = 'a2';
const INITIAL_FULL_MOVE_NUMBER = 1;

const setPiecePlacement = (piecePlacement: PiecePlacement) => {
	gameState.boardState.piecePlacement = piecePlacement;
};

describe('Given a game in progress', () => {
	beforeEach(() => {
		resetGame();
	});
	describe('When no tile is currently selected', () => {
		test('Then selecting a tile without a piece should do nothing', () => {
			setPiecePlacement({});
			selectTile(A1);
			expect(gameState.selectedTileId).toBeUndefined();
		});

		test('Then selecting a tile with a piece from the same side should set the selected tile id', () => {
			setPiecePlacement({ [A1]: { type: 'pawn', side: 'w' } });
			selectTile(A1);
			expect(gameState.selectedTileId).toBe(A1);
		});

		test('Then selecting a tile from the opposite side should do nothing', () => {
			setPiecePlacement({ [A1]: { type: 'pawn', side: 'b' } });
			selectTile(A1);
			expect(gameState.selectedTileId).toBeUndefined();
		});
	});
	describe('When a tile is currently selected', () => {
		beforeEach(() => {
			setPiecePlacement({ [A1]: { type: 'pawn', side: 'w' } });
			gameState.selectedTileId = A1;
		});
		test('Then selecting the same tile should deselect the tile', () => {
			selectTile(A1);
			expect(gameState.selectedTileId).toBeUndefined();
		});
		describe('When selecting any other tile', () => {
			test('Then selecting a different tile should move the piece to the new tile', () => {
				gameState.boardState.activeSide = 'w';
				gameState.boardState.fullMoveNumber = INITIAL_FULL_MOVE_NUMBER;
				selectTile(A2);
				expect(gameState.boardState.piecePlacement[A1]).toBeUndefined();
				expect(gameState.boardState.piecePlacement[A2]).toEqual({ type: 'pawn', side: 'w' });
			});
			test('And should clear the selection', () => {
				gameState.boardState.activeSide = 'w';
				gameState.boardState.fullMoveNumber = INITIAL_FULL_MOVE_NUMBER;
				selectTile(A2);
				expect(gameState.selectedTileId).toBeUndefined();
			});
			describe('Given the current side is w', () => {
				beforeEach(() => {
					gameState.boardState.activeSide = 'w';
					gameState.boardState.fullMoveNumber = INITIAL_FULL_MOVE_NUMBER;
					selectTile(A2);
				});
				test('Then selecting a different tile should advance the turn to the b side', () => {
					expect(gameState.boardState.activeSide).toBe('b');
				});
				test('And should not increment the full move number', () => {
					expect(gameState.boardState.fullMoveNumber).toBe(INITIAL_FULL_MOVE_NUMBER);
				});
			});
			describe('Given the current side is b', () => {
				beforeEach(() => {
					gameState.boardState.activeSide = 'b';
					gameState.boardState.fullMoveNumber = INITIAL_FULL_MOVE_NUMBER;
					selectTile(A2);
				});
				test('Then selecting a different tile should advance the turn to the w side', () => {
					expect(gameState.boardState.activeSide).toBe('w');
				});
				test('And should increment the full move number', () => {
					expect(gameState.boardState.fullMoveNumber).toBe(INITIAL_FULL_MOVE_NUMBER + 1);
				});
			});
		});
		describe('When selecting a tile with a piece from the same side', () => {
			test('Then selection should move to that tile', () => {
				gameState.boardState.piecePlacement[A2] = { type: 'pawn', side: 'w' };
				selectTile(A2);
				expect(gameState.selectedTileId).toBe(A2);
				expect(gameState.boardState.piecePlacement[A1]).toEqual({ type: 'pawn', side: 'w' });
				expect(gameState.boardState.piecePlacement[A2]).toEqual({ type: 'pawn', side: 'w' });
				expect(gameState.boardState.activeSide).toBe('w');
				expect(gameState.boardState.fullMoveNumber).toBe(INITIAL_FULL_MOVE_NUMBER);
			});
		});
		test.todo('Test legal moves once implemented');
	});
});
