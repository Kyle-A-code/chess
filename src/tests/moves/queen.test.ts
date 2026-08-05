import { describe, expect, test } from 'vitest';
import type { PiecePlacement, Side } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';
import { pseudoLegalQueenMoves } from '../../lib/moves/queen';
import { createBoardState } from '../helpers/createBoardState';
import { runInvalidTileTests } from './helpers/runInvalidTileTests';
import { runDiagonalMoveTests } from './helpers/runDiagonalMoveTests';
import { runOrthogonalMoveTests } from './helpers/runOrthogonalMoveTests';

type MoveContextOptions = {
	queenSquare: Square;
	side: Side;
	extras?: PiecePlacement;
};

const subject = ({ queenSquare, side, extras = {} }: MoveContextOptions) => {
	const piecePlacement: PiecePlacement = {
		[queenSquare]: { type: 'queen', side },
		...extras
	};
	const boardState = createBoardState(piecePlacement);
	return pseudoLegalQueenMoves(boardState, queenSquare);
};

runInvalidTileTests({
	moveGenerator: pseudoLegalQueenMoves,
	expectedPieceError: 'Tile is not a queen'
});

runDiagonalMoveTests({
	subject: ({ square, side, extras }) => subject({ queenSquare: square, side, extras })
});

runOrthogonalMoveTests({
	subject: ({ square, side, extras }) => subject({ queenSquare: square, side, extras })
});

describe('Given a valid queen tile is provided', () => {
	test('When the queen is on d4 with no blockers, Then it should include all 27 legal moves', () => {
		const moves = subject({ queenSquare: 'd4', side: 'w' });
		const destinations = moves.map((move) => move.to).sort();

		expect(destinations).toEqual([
			'a1',
			'a4',
			'a7',
			'b2',
			'b4',
			'b6',
			'c3',
			'c4',
			'c5',
			'd1',
			'd2',
			'd3',
			'd5',
			'd6',
			'd7',
			'd8',
			'e3',
			'e4',
			'e5',
			'f2',
			'f4',
			'f6',
			'g1',
			'g4',
			'g7',
			'h4',
			'h8'
		]);
		expect(moves).toHaveLength(27);
	});

	test('When mixed blockers are present on diagonal and orthogonal rays, Then captures are included and squares beyond are excluded', () => {
		const moves = subject({
			queenSquare: 'd4',
			side: 'w',
			extras: {
				f6: { type: 'pawn', side: 'b' },
				d6: { type: 'pawn', side: 'w' }
			}
		});

		expect(moves).toContainEqual({ to: 'e5' });
		expect(moves).toContainEqual({ to: 'f6' });
		expect(moves).not.toContainEqual({ to: 'g7' });
		expect(moves).toContainEqual({ to: 'd5' });
		expect(moves).not.toContainEqual({ to: 'd6' });
		expect(moves).not.toContainEqual({ to: 'd7' });
	});
});
