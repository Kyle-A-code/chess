import { beforeEach, describe, expect, test } from 'vitest';
import type { BoardState, PiecePlacement, Side } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';
import { handleRookSideEffects, pseudoLegalRookMoves } from '../../lib/moves/rook';
import { createBoardState } from '../helpers/createBoardState';
import { runInvalidTileTests } from './helpers/runInvalidTileTests';
import { runOrthogonalMoveTests } from './helpers/runOrthogonalMoveTests';

type MoveContextOptions = {
	rookSquare: Square;
	side: Side;
	extras?: PiecePlacement;
};

const subject = ({ rookSquare, side, extras = {} }: MoveContextOptions) => {
	const piecePlacement: PiecePlacement = {
		[rookSquare]: { type: 'rook', side },
		...extras
	};
	const boardState = createBoardState(piecePlacement);
	return pseudoLegalRookMoves(boardState, rookSquare);
};

runInvalidTileTests({
	moveGenerator: pseudoLegalRookMoves,
	expectedPieceError: 'Tile is not a rook'
});

runOrthogonalMoveTests({
	subject: ({ square, side, extras }) => subject({ rookSquare: square, side, extras })
});

describe('Given a valid rook tile is provided', () => {
	test('When the rook is on d4 with no blockers, Then it should include all 14 legal orthogonal moves', () => {
		const moves = subject({ rookSquare: 'd4', side: 'w' });
		const destinations = moves.map((move) => move.to).sort();

		expect(destinations).toEqual([
			'a4',
			'b4',
			'c4',
			'd1',
			'd2',
			'd3',
			'd5',
			'd6',
			'd7',
			'd8',
			'e4',
			'f4',
			'g4',
			'h4'
		]);
		expect(moves).toHaveLength(14);
	});
});

describe('Given processing rook side effects', () => {
	let boardState: BoardState;

	beforeEach(() => {
		boardState = createBoardState({});
	});

	test('When castling availability is undefined, Then it should keep castling availability unchanged', () => {
		handleRookSideEffects(boardState, 'a1');
		expect(boardState.castlingAvailability).toBeUndefined();
	});

	test('When castling availability is empty, Then it should keep castling availability unchanged', () => {
		boardState.castlingAvailability = '';
		handleRookSideEffects(boardState, 'a1');
		expect(boardState.castlingAvailability).toBe('');
	});

	test('When rook moves from a1, Then it should remove white queenside castling availability', () => {
		boardState.castlingAvailability = 'KQkq';
		handleRookSideEffects(boardState, 'a1');
		expect(boardState.castlingAvailability).toBe('Kkq');
	});

	test('When rook moves from h1, Then it should remove white kingside castling availability', () => {
		boardState.castlingAvailability = 'KQkq';
		handleRookSideEffects(boardState, 'h1');
		expect(boardState.castlingAvailability).toBe('Qkq');
	});

	test('When rook moves from a8, Then it should remove black queenside castling availability', () => {
		boardState.castlingAvailability = 'KQkq';
		handleRookSideEffects(boardState, 'a8');
		expect(boardState.castlingAvailability).toBe('KQk');
	});

	test('When rook moves from h8, Then it should remove black kingside castling availability', () => {
		boardState.castlingAvailability = 'KQkq';
		handleRookSideEffects(boardState, 'h8');
		expect(boardState.castlingAvailability).toBe('KQq');
	});

	test('When the relevant castling right is already absent, Then castling availability should remain unchanged', () => {
		boardState.castlingAvailability = 'Kkq';
		handleRookSideEffects(boardState, 'a1');
		expect(boardState.castlingAvailability).toBe('Kkq');
	});
});
