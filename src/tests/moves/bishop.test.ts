import { describe, expect, test } from 'vitest';
import type { PiecePlacement, Side } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';
import { pseudoLegalBishopMoves } from '../../lib/moves/bishop';
import { createBoardState } from '../helpers/createBoardState';
import { runInvalidTileTests } from './helpers/runInvalidTileTests';
import { runDiagonalMoveTests } from './helpers/runDiagonalMoveTests';

type MoveContextOptions = {
	bishopSquare: Square;
	side: Side;
	extras?: PiecePlacement;
};

const subject = ({ bishopSquare, side, extras = {} }: MoveContextOptions) => {
	const piecePlacement: PiecePlacement = {
		[bishopSquare]: { type: 'bishop', side },
		...extras
	};
	const boardState = createBoardState(piecePlacement);
	return pseudoLegalBishopMoves(boardState, bishopSquare);
};

runInvalidTileTests({
	moveGenerator: pseudoLegalBishopMoves,
	expectedPieceError: 'Tile is not a bishop'
});

describe('Given a valid bishop tile is provided', () => {
	test('When the bishop is on d4 with no blockers, Then it should include all 13 legal diagonal moves', () => {
		const moves = subject({ bishopSquare: 'd4', side: 'w' });
		const destinations = moves.map((move) => move.to).sort();

		expect(destinations).toEqual([
			'a1',
			'a7',
			'b2',
			'b6',
			'c3',
			'c5',
			'e3',
			'e5',
			'f2',
			'f6',
			'g1',
			'g7',
			'h8'
		]);
		expect(moves).toHaveLength(13);
	});

	test.each([
		['a1', ['b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8']],
		['a4', ['b3', 'b5', 'c2', 'c6', 'd1', 'd7', 'e8']]
	] as const)(
		'When the bishop is on %s with no blockers, Then it should include only in-bounds diagonal moves',
		(bishopSquare, expectedDestinations) => {
			const moves = subject({ bishopSquare, side: 'w' });
			const destinations = moves.map((move) => move.to).sort();

			expect(destinations).toEqual([...expectedDestinations].sort());
			expect(moves).toHaveLength(expectedDestinations.length);
		}
	);
});

runDiagonalMoveTests({
	subject: ({ square, side, extras }) => subject({ bishopSquare: square, side, extras })
});
