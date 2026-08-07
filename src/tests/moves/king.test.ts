import { beforeEach, describe, expect, test } from 'vitest';
import type { BoardState, PiecePlacement, Side } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';
import { handleKingSideEffects, pseudoLegalKingMoves } from '../../lib/moves/king';
import { createBoardState } from '../helpers/createBoardState';
import { runInvalidTileTests } from './helpers/runInvalidTileTests';

type MoveContextOptions = {
	kingSquare: Square;
	side: Side;
	extras?: PiecePlacement;
	castlingAvailability?: string;
};

const subject = ({ kingSquare, side, extras = {}, castlingAvailability }: MoveContextOptions) => {
	const piecePlacement: PiecePlacement = {
		[kingSquare]: { type: 'king', side },
		...extras
	};
	const boardState = createBoardState(piecePlacement);
	boardState.castlingAvailability = castlingAvailability;
	return pseudoLegalKingMoves(boardState, kingSquare);
};

runInvalidTileTests({
	moveGenerator: pseudoLegalKingMoves,
	expectedPieceError: 'Tile is not a king'
});

describe('Given a valid king tile is provided', () => {
	test('When the king is on d4 with no blockers, Then it should include all 8 adjacent legal moves', () => {
		const moves = subject({ kingSquare: 'd4', side: 'w' });
		const destinations = moves.map((move) => move.to).sort();

		expect(destinations).toEqual(['c3', 'c4', 'c5', 'd3', 'd5', 'e3', 'e4', 'e5']);
		expect(moves).toHaveLength(8);
	});

	test('When the king is on a1 with no blockers, Then it should include only in-bounds adjacent moves', () => {
		const moves = subject({ kingSquare: 'a1', side: 'w' });
		const destinations = moves.map((move) => move.to).sort();

		expect(destinations).toEqual(['a2', 'b1', 'b2']);
		expect(moves).toHaveLength(3);
	});

	test('When an adjacent square has an enemy piece, Then it should include the capture move', () => {
		const moves = subject({
			kingSquare: 'd4',
			side: 'w',
			extras: { e5: { type: 'pawn', side: 'b' } }
		});
		expect(moves).toContainEqual({ to: 'e5' });
	});

	test('When an adjacent square has a same side piece, Then it should not include that move', () => {
		const moves = subject({
			kingSquare: 'd4',
			side: 'w',
			extras: { e5: { type: 'pawn', side: 'w' } }
		});
		expect(moves).not.toContainEqual({ to: 'e5' });
	});

	describe('Given castling moves are considered', () => {
		test('When white kingside castling rights and spaces are available, Then it should include kingside castling move', () => {
			const moves = subject({
				kingSquare: 'e1',
				side: 'w',
				extras: { h1: { type: 'rook', side: 'w' } },
				castlingAvailability: 'K'
			});
			expect(moves).toContainEqual({ to: 'g1', isCastlingKingside: true });
		});

		test('When white queenside castling rights and spaces are available, Then it should include queenside castling move', () => {
			const moves = subject({
				kingSquare: 'e1',
				side: 'w',
				extras: { a1: { type: 'rook', side: 'w' } },
				castlingAvailability: 'Q'
			});
			expect(moves).toContainEqual({ to: 'c1', isCastlingQueenside: true });
		});

		test('When black kingside castling rights and spaces are available, Then it should include kingside castling move', () => {
			const moves = subject({
				kingSquare: 'e8',
				side: 'b',
				extras: { h8: { type: 'rook', side: 'b' } },
				castlingAvailability: 'k'
			});
			expect(moves).toContainEqual({ to: 'g8', isCastlingKingside: true });
		});

		test('When black queenside castling rights and spaces are available, Then it should include queenside castling move', () => {
			const moves = subject({
				kingSquare: 'e8',
				side: 'b',
				extras: { a8: { type: 'rook', side: 'b' } },
				castlingAvailability: 'q'
			});
			expect(moves).toContainEqual({ to: 'c8', isCastlingQueenside: true });
		});

		test('When king is not on starting square, Then it should not include castling moves', () => {
			const moves = subject({
				kingSquare: 'e2',
				side: 'w',
				extras: {
					a1: { type: 'rook', side: 'w' },
					h1: { type: 'rook', side: 'w' }
				},
				castlingAvailability: 'KQ'
			});
			expect(moves).not.toContainEqual({ to: 'c1', isCastlingQueenside: true });
			expect(moves).not.toContainEqual({ to: 'g1', isCastlingKingside: true });
		});

		test('When castling path is blocked, Then it should not include castling move', () => {
			const moves = subject({
				kingSquare: 'e1',
				side: 'w',
				extras: {
					h1: { type: 'rook', side: 'w' },
					f1: { type: 'knight', side: 'w' }
				},
				castlingAvailability: 'K'
			});
			expect(moves).not.toContainEqual({ to: 'g1', isCastlingKingside: true });
		});

		test('When castling right is absent, Then it should not include castling move', () => {
			const moves = subject({
				kingSquare: 'e1',
				side: 'w',
				extras: { h1: { type: 'rook', side: 'w' } },
				castlingAvailability: 'Q'
			});
			expect(moves).not.toContainEqual({ to: 'g1', isCastlingKingside: true });
		});
	});
});

describe('Given processing king side effects', () => {
	let boardState: BoardState;

	beforeEach(() => {
		boardState = createBoardState({});
	});

	test('When white queenside castling move is applied, Then rook should move from a1 to d1', () => {
		boardState.activeSide = 'w';
		boardState.castlingAvailability = 'KQkq';
		boardState.piecePlacement.a1 = { type: 'rook', side: 'w' };

		handleKingSideEffects(boardState, { to: 'c1', isCastlingQueenside: true });

		expect(boardState.piecePlacement.a1).toBeUndefined();
		expect(boardState.piecePlacement.d1).toEqual({ type: 'rook', side: 'w' });
	});

	test('When black queenside castling move is applied, Then rook should move from a8 to d8', () => {
		boardState.activeSide = 'b';
		boardState.castlingAvailability = 'KQkq';
		boardState.piecePlacement.a8 = { type: 'rook', side: 'b' };

		handleKingSideEffects(boardState, { to: 'c8', isCastlingQueenside: true });

		expect(boardState.piecePlacement.a8).toBeUndefined();
		expect(boardState.piecePlacement.d8).toEqual({ type: 'rook', side: 'b' });
	});

	test('When white kingside castling move is applied, Then rook should move from h1 to f1', () => {
		boardState.activeSide = 'w';
		boardState.castlingAvailability = 'KQkq';
		boardState.piecePlacement.h1 = { type: 'rook', side: 'w' };

		handleKingSideEffects(boardState, { to: 'g1', isCastlingKingside: true });

		expect(boardState.piecePlacement.h1).toBeUndefined();
		expect(boardState.piecePlacement.f1).toEqual({ type: 'rook', side: 'w' });
	});

	test('When black kingside castling move is applied, Then rook should move from h8 to f8', () => {
		boardState.activeSide = 'b';
		boardState.castlingAvailability = 'KQkq';
		boardState.piecePlacement.h8 = { type: 'rook', side: 'b' };

		handleKingSideEffects(boardState, { to: 'g8', isCastlingKingside: true });

		expect(boardState.piecePlacement.h8).toBeUndefined();
		expect(boardState.piecePlacement.f8).toEqual({ type: 'rook', side: 'b' });
	});

	test('When white king moves, Then it should remove white castling rights', () => {
		boardState.activeSide = 'w';
		boardState.castlingAvailability = 'KQkq';

		handleKingSideEffects(boardState, { to: 'e2' });

		expect(boardState.castlingAvailability).toBe('kq');
	});

	test('When black king moves, Then it should remove black castling rights', () => {
		boardState.activeSide = 'b';
		boardState.castlingAvailability = 'KQkq';

		handleKingSideEffects(boardState, { to: 'e7' });

		expect(boardState.castlingAvailability).toBe('KQ');
	});

	test('When castling availability is undefined, Then it should leave castling availability unchanged', () => {
		handleKingSideEffects(boardState, { to: 'e2' });
		expect(boardState.castlingAvailability).toBeUndefined();
	});
});
