import { describe, expect, test } from 'vitest';
import type { Square } from '../../../lib/game/boardPrimitives';
import type { Move, PiecePlacement, Side } from '../../../lib/types';

type DiagonalMoveContext = {
	square: Square;
	side: Side;
	extras?: PiecePlacement;
};

type DiagonalMoveSubject = (context: DiagonalMoveContext) => Move[];

type RunDiagonalMoveTestsArgs = {
	subject: DiagonalMoveSubject;
};

export const runDiagonalMoveTests = ({ subject }: RunDiagonalMoveTestsArgs) => {
	describe('Given diagonal moves are considered', () => {
		test('When the piece is on d4 with no blockers, Then it should include all expected diagonal squares', () => {
			const moves = subject({ square: 'd4', side: 'w' });
			const destinations = moves.map((move) => move.to);

			expect(destinations).toEqual(
				expect.arrayContaining(['a1', 'a7', 'b2', 'b6', 'c3', 'c5', 'e3', 'e5', 'f2', 'f6', 'g1', 'g7', 'h8'])
			);
		});

		test.each([
			['a1', ['b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8']],
			['a4', ['b3', 'b5', 'c2', 'c6', 'd1', 'd7', 'e8']]
		] as const)(
			'When the piece is on %s with no blockers, Then it should include all expected in-bounds diagonal squares',
			(square, expectedDestinations) => {
				const moves = subject({ square, side: 'w' });
				const destinations = moves.map((move) => move.to);
				expect(destinations).toEqual(expect.arrayContaining([...expectedDestinations]));
			}
		);

		test('When a same side piece blocks a diagonal, Then it should not include blocker square or any squares beyond', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { f6: { type: 'pawn', side: 'w' } }
			});

			expect(moves).toContainEqual({ to: 'e5' });
			expect(moves).not.toContainEqual({ to: 'f6' });
			expect(moves).not.toContainEqual({ to: 'g7' });
			expect(moves).not.toContainEqual({ to: 'h8' });
		});

		test('When an enemy piece blocks a diagonal, Then it should include capture square and exclude squares beyond', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { f6: { type: 'pawn', side: 'b' } }
			});

			expect(moves).toContainEqual({ to: 'e5' });
			expect(moves).toContainEqual({ to: 'f6' });
			expect(moves).not.toContainEqual({ to: 'g7' });
			expect(moves).not.toContainEqual({ to: 'h8' });
		});

		test('When an adjacent same side piece blocks a diagonal, Then it should block all squares in that direction', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { c5: { type: 'pawn', side: 'w' } }
			});

			expect(moves).not.toContainEqual({ to: 'c5' });
			expect(moves).not.toContainEqual({ to: 'b6' });
			expect(moves).not.toContainEqual({ to: 'a7' });
		});

		test('When an adjacent enemy piece is on a diagonal, Then it should include capture square and block all beyond', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { c5: { type: 'pawn', side: 'b' } }
			});

			expect(moves).toContainEqual({ to: 'c5' });
			expect(moves).not.toContainEqual({ to: 'b6' });
			expect(moves).not.toContainEqual({ to: 'a7' });
		});
	});
};
