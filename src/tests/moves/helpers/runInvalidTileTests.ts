import { describe, expect, test } from 'vitest';
import type { Square } from '../../../lib/game/boardPrimitives';
import type { BoardState, PiecePlacement } from '../../../lib/types';
import { createBoardState } from '../../helpers/createBoardState';

const INVALID_PIECE_TILE: Square = 'e4';

type MoveGenerator = (boardState: BoardState, square: Square) => unknown;

type RunInvalidTileTestsArgs = {
	moveGenerator: MoveGenerator;
	expectedPieceError: string;
};

export const runInvalidTileTests = ({ moveGenerator, expectedPieceError }: RunInvalidTileTestsArgs) => {
	describe('Given an invalid tile is provided', () => {
		const piecePlacement: PiecePlacement = {
			// @ts-expect-error testing runtime guard for invalid piece type
			[INVALID_PIECE_TILE]: { type: 'nonexistent', side: 'w' }
		};
		const boardState = createBoardState(piecePlacement);

		test('When tile piece does not match expected piece type, Then it should throw expected piece error', () => {
			expect(() => moveGenerator(boardState, INVALID_PIECE_TILE)).toThrow(expectedPieceError);
		});

		test('When tile id is invalid, Then it should throw invalid tile', () => {
			// @ts-expect-error testing runtime guard for invalid tile id
			expect(() => moveGenerator(boardState, 'z9')).toThrow('Invalid tile');
		});
	});
};
