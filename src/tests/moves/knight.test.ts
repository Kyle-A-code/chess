import { describe, expect, test } from 'vitest';
import { pseudoLegalKnightMoves } from '../../lib/moves/knight';
import type { PiecePlacement, Side } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';
import { createBoardState } from '../helpers/createBoardState';
import { runInvalidTileTests } from './helpers/runInvalidTileTests';

type MoveContextOptions = {
	knightSquare: Square;
	side: Side;
	extras?: PiecePlacement;
};

const subject = ({ knightSquare, side, extras = {} }: MoveContextOptions) => {
	const piecePlacement: PiecePlacement = {
		[knightSquare]: { type: 'knight', side },
		...extras
	};
	const boardState = createBoardState(piecePlacement);
	return pseudoLegalKnightMoves(boardState, knightSquare);
};

runInvalidTileTests({
	moveGenerator: pseudoLegalKnightMoves,
	expectedPieceError: 'Tile is not a knight'
});

describe('Given a valid knight tile is provided', () => {
	test('When the knight is on d4 with no blockers, Then it should include all 8 legal moves', () => {
		const moves = subject({ knightSquare: 'd4', side: 'w' });
		const destinations = moves.map((move) => move.to).sort();

		expect(destinations).toEqual(['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5']);
		expect(moves).toHaveLength(8);
	});

	test.each([
		['a1', ['b3', 'c2']],
		['a4', ['b2', 'b6', 'c3', 'c5']],
		['b1', ['a3', 'c3', 'd2']],
		['h8', ['f7', 'g6']]
	] as const)(
		'When the knight is on %s with no blockers, Then it should include only in-bounds moves',
		(knightSquare, expectedDestinations) => {
			const moves = subject({ knightSquare, side: 'w' });
			const destinations = moves.map((move) => move.to).sort();
			expect(destinations).toEqual([...expectedDestinations].sort());
			expect(moves).toHaveLength(expectedDestinations.length);
		}
	);

	test('When a legal target square has an enemy piece, Then it should include that capture move', () => {
		const moves = subject({
			knightSquare: 'd4',
			side: 'w',
			extras: { f5: { type: 'pawn', side: 'b' } }
		});

		expect(moves).toContainEqual({ to: 'f5' });
		expect(moves).toHaveLength(8);
	});

	test('When a legal target square has an allied piece, Then it should not include that move', () => {
		const moves = subject({
			knightSquare: 'd4',
			side: 'w',
			extras: { f5: { type: 'pawn', side: 'w' } }
		});

		expect(moves).not.toContainEqual({ to: 'f5' });
		expect(moves).toHaveLength(7);
	});

	test('When legal target squares include both enemy and allied pieces, Then enemy squares are included and allied squares are excluded', () => {
		const moves = subject({
			knightSquare: 'd4',
			side: 'w',
			extras: {
				b3: { type: 'pawn', side: 'w' },
				e6: { type: 'pawn', side: 'b' }
			}
		});

		expect(moves).not.toContainEqual({ to: 'b3' });
		expect(moves).toContainEqual({ to: 'e6' });
		expect(moves).toHaveLength(7);
	});
});
