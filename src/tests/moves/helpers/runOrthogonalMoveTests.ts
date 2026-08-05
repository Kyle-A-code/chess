import { describe, expect, test } from 'vitest';
import type { Square } from '../../../lib/game/boardPrimitives';
import type { Move, PiecePlacement, Side } from '../../../lib/types';

type OrthogonalMoveContext = {
	square: Square;
	side: Side;
	extras?: PiecePlacement;
};

type OrthogonalMoveSubject = (context: OrthogonalMoveContext) => Move[];

type RunOrthogonalMoveTestsArgs = {
	subject: OrthogonalMoveSubject;
};

export const runOrthogonalMoveTests = ({ subject }: RunOrthogonalMoveTestsArgs) => {
	describe('Given orthogonal moves are considered', () => {
		test('When the piece is on d4 with no blockers, Then it should include all expected orthogonal squares', () => {
			const moves = subject({ square: 'd4', side: 'w' });
			const destinations = moves.map((move) => move.to);

			expect(destinations).toEqual(
				expect.arrayContaining([
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
				])
			);
		});

		test.each([
			['a1', ['a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']],
			['a4', ['a1', 'a2', 'a3', 'a5', 'a6', 'a7', 'a8', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4']]
		] as const)(
			'When the piece is on %s with no blockers, Then it should include all expected in-bounds orthogonal squares',
			(square, expectedDestinations) => {
				const moves = subject({ square, side: 'w' });
				const destinations = moves.map((move) => move.to);
				expect(destinations).toEqual(expect.arrayContaining([...expectedDestinations]));
			}
		);

		test('When a same side piece blocks a file, Then it should not include blocker square or any squares beyond', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { d6: { type: 'pawn', side: 'w' } }
			});

			expect(moves).toContainEqual({ to: 'd5' });
			expect(moves).not.toContainEqual({ to: 'd6' });
			expect(moves).not.toContainEqual({ to: 'd7' });
			expect(moves).not.toContainEqual({ to: 'd8' });
		});

		test('When an enemy piece blocks a file, Then it should include capture square and exclude squares beyond', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { d6: { type: 'pawn', side: 'b' } }
			});

			expect(moves).toContainEqual({ to: 'd5' });
			expect(moves).toContainEqual({ to: 'd6' });
			expect(moves).not.toContainEqual({ to: 'd7' });
			expect(moves).not.toContainEqual({ to: 'd8' });
		});

		test('When an adjacent same side piece blocks a rank, Then it should block all squares in that direction', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { e4: { type: 'pawn', side: 'w' } }
			});

			expect(moves).not.toContainEqual({ to: 'e4' });
			expect(moves).not.toContainEqual({ to: 'f4' });
			expect(moves).not.toContainEqual({ to: 'g4' });
			expect(moves).not.toContainEqual({ to: 'h4' });
		});

		test('When an adjacent enemy piece is on a rank, Then it should include capture square and block all beyond', () => {
			const moves = subject({
				square: 'd4',
				side: 'w',
				extras: { e4: { type: 'pawn', side: 'b' } }
			});

			expect(moves).toContainEqual({ to: 'e4' });
			expect(moves).not.toContainEqual({ to: 'f4' });
			expect(moves).not.toContainEqual({ to: 'g4' });
			expect(moves).not.toContainEqual({ to: 'h4' });
		});
	});
};
