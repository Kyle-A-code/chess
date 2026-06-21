import { describe, test, expect } from 'vitest';
import { gameState, resetGame } from '../../lib/game/gameController.svelte';

const EXPECTED_INITIAL_BOARD_STATE = {
	piecePlacement: {
		a1: { type: 'rook', side: 'w' },
		b1: { type: 'knight', side: 'w' },
		c1: { type: 'bishop', side: 'w' },
		d1: { type: 'queen', side: 'w' },
		e1: { type: 'king', side: 'w' },
		f1: { type: 'bishop', side: 'w' },
		g1: { type: 'knight', side: 'w' },
		h1: { type: 'rook', side: 'w' },
		a2: { type: 'pawn', side: 'w' },
		b2: { type: 'pawn', side: 'w' },
		c2: { type: 'pawn', side: 'w' },
		d2: { type: 'pawn', side: 'w' },
		e2: { type: 'pawn', side: 'w' },
		f2: { type: 'pawn', side: 'w' },
		g2: { type: 'pawn', side: 'w' },
		h2: { type: 'pawn', side: 'w' },
		a7: { type: 'pawn', side: 'b' },
		b7: { type: 'pawn', side: 'b' },
		c7: { type: 'pawn', side: 'b' },
		d7: { type: 'pawn', side: 'b' },
		e7: { type: 'pawn', side: 'b' },
		f7: { type: 'pawn', side: 'b' },
		g7: { type: 'pawn', side: 'b' },
		h7: { type: 'pawn', side: 'b' },
		a8: { type: 'rook', side: 'b' },
		b8: { type: 'knight', side: 'b' },
		c8: { type: 'bishop', side: 'b' },
		d8: { type: 'queen', side: 'b' },
		e8: { type: 'king', side: 'b' },
		f8: { type: 'bishop', side: 'b' },
		g8: { type: 'knight', side: 'b' },
		h8: { type: 'rook', side: 'b' }
	},
	activeSide: 'w',
	castlingAvailability: 'KQkq',
	enPassantTarget: undefined,
	halfMoveClock: 0,
	fullMoveNumber: 1
};

describe('When resetting the game', () => {
	test('Then the game should be reset to the initial state', () => {
		resetGame();
		expect(gameState.selectedTileId).toBeUndefined();
		expect(gameState.boardState).toEqual(EXPECTED_INITIAL_BOARD_STATE);
	});
});
