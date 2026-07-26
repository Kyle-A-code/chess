import { describe, expect, test } from 'vitest';
import { pseudoLegalPawnMoves } from '../../lib/moves/pawn';
import type { BoardState, PiecePlacement, Side, Tile } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';

const createBoardState = (
	piecePlacement: PiecePlacement,
	enPassantTarget?: Square
): BoardState => ({
	piecePlacement,
	activeSide: 'w',
	enPassantTarget,
	halfMoveClock: 0,
	fullMoveNumber: 1
});

const createPawnTile = (id: Square, side: Side): Tile => ({
	id,
	colour: 'w',
	piece: { type: 'pawn', side }
});

const getMoves = (boardState: BoardState, pawnSquare: Square, side: Side) => {
	return pseudoLegalPawnMoves(boardState, createPawnTile(pawnSquare, side));
};

type MoveContextOptions = {
	pawnSquare: Square;
	side: Side;
	extras?: PiecePlacement;
	enPassantTarget?: Square;
};

const subject = ({ pawnSquare, side, extras = {}, enPassantTarget }: MoveContextOptions) => {
	const piecePlacement: PiecePlacement = {
		[pawnSquare]: { type: 'pawn', side },
		...extras
	};
	const boardState = createBoardState(piecePlacement, enPassantTarget);
	return getMoves(boardState, pawnSquare, side);
};

describe('Given an invalid tile is provided', () => {
	const boardState = createBoardState({});
	test('When tile piece is not a pawn, Then it should throw tile is not a pawn', () => {
		const nonPawnTile: Tile = {
			id: 'e2',
			colour: 'w',
			piece: { type: 'rook', side: 'w' }
		};

		expect(() => pseudoLegalPawnMoves(boardState, nonPawnTile)).toThrow('Tile is not a pawn');
	});

	test('When tile id is invalid, Then it should throw invalid tile', () => {
		// @ts-expect-error testing runtime guard for invalid tile id
		const invalidTile: Tile = { id: 'z9', colour: 'w', piece: { type: 'pawn', side: 'w' } };

		expect(() => pseudoLegalPawnMoves(boardState, invalidTile)).toThrow('Invalid tile');
	});
});

describe('Given a valid pawn tile is provided', () => {
	describe('Given forward advances are considered', () => {
		describe.each([
			['white', 'w', 'e2', 'e3', 'e4', 'b'],
			['black', 'b', 'e7', 'e6', 'e5', 'w']
		] as const)(
			'Given %s pawn is on starting rank',
			(_label, side, pawnSquare, oneStepSquare, twoStepSquare, enemySide) => {
				describe('When first forward square is empty', () => {
					test('Then it should include a one square forward move', () => {
						const moves = subject({ pawnSquare, side });
						expect(moves).toContainEqual({
							to: oneStepSquare,
							isPromotion: false
						});
					});

					describe('And second forward square is empty', () => {
						test('Then it should include a two square forward move with en passant target flag', () => {
							const moves = subject({ pawnSquare, side });
							expect(moves).toContainEqual({
								to: twoStepSquare,
								isEnPassantTarget: true
							});
						});
					});

					describe('And second forward square is occupied', () => {
						test('Then it should not include a two square forward move', () => {
							const moves = subject({
								pawnSquare,
								side,
								extras: { [twoStepSquare]: { type: 'pawn', side: enemySide } }
							});
							expect(moves).toContainEqual({
								to: oneStepSquare,
								isPromotion: false
							});
							expect(moves).not.toContainEqual({
								to: twoStepSquare,
								isEnPassantTarget: true
							});
						});
					});
				});

				describe('When first forward square is occupied', () => {
					test.each([['enemy piece'], ['same side piece']] as const)(
						'Then it should not include one or two square forward moves with %s',
						(reason) => {
							const blockingSide = reason === 'enemy piece' ? enemySide : side;
							const moves = subject({
								pawnSquare,
								side,
								extras: { [oneStepSquare]: { type: 'pawn', side: blockingSide } }
							});

							expect(moves).not.toContainEqual({
								to: oneStepSquare,
								isPromotion: false
							});
							expect(moves).not.toContainEqual({
								to: twoStepSquare,
								isEnPassantTarget: true
							});
						}
					);
				});
			}
		);

		describe.each([
			['white', 'w', 'e7', 'e8'],
			['black', 'b', 'e2', 'e1']
		] as const)(
			'Given %s pawn is on penultimate rank',
			(_label, side, pawnSquare, oneStepSquare) => {
				describe('When first forward square is empty', () => {
					test('Then it should include a one square forward move marked as promotion', () => {
						const moves = subject({ pawnSquare, side });
						expect(moves).toContainEqual({
							to: oneStepSquare,
							isPromotion: true
						});
					});
				});
			}
		);
	});

	describe('Given diagonal standard captures are considered', () => {
		describe.each([
			['left', 'd6'],
			['right', 'f6']
		] as const)(
			'Given %s diagonal target square for a white pawn on e5',
			(_direction, targetSquare) => {
				test('When target square is empty, Then it should not include a capture move', () => {
					const moves = subject({ pawnSquare: 'e5', side: 'w' });
					expect(moves).not.toContainEqual({
						to: targetSquare,
						isPromotion: false
					});
				});

				test('When target square has an enemy piece, Then it should include a capture move', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						extras: { [targetSquare]: { type: 'pawn', side: 'b' } }
					});
					expect(moves).toContainEqual({
						to: targetSquare,
						isPromotion: false
					});
				});

				test('When target square has a same side piece, Then it should not include a capture move', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						extras: { [targetSquare]: { type: 'pawn', side: 'w' } }
					});
					expect(moves).not.toContainEqual({
						to: targetSquare,
						isPromotion: false
					});
				});
			}
		);

		test.each([
			['white left', 'w', 'e7', 'd8', 'b'],
			['white right', 'w', 'e7', 'f8', 'b'],
			['black left', 'b', 'e2', 'd1', 'w'],
			['black right', 'b', 'e2', 'f1', 'w']
		] as const)(
			'When %s diagonal capture reaches last rank, Then move should be marked as promotion',
			(_label, side, pawnSquare, targetSquare, enemySide) => {
				const moves = subject({
					pawnSquare,
					side,
					extras: { [targetSquare]: { type: 'pawn', side: enemySide } }
				});
				expect(moves).toContainEqual({ to: targetSquare, isPromotion: true });
			}
		);
	});

	describe('Given en passant captures are considered', () => {
		describe.each([
			['left', 'd6', 'd5'],
			['right', 'f6', 'f5']
		] as const)(
			'Given %s en passant candidate for a white pawn on e5',
			(_direction, targetSquare, adjacentSquare) => {
				test('When target square is empty and adjacent has enemy pawn, Then it should include en passant capture', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						extras: { [adjacentSquare]: { type: 'pawn', side: 'b' } },
						enPassantTarget: targetSquare
					});
					expect(moves).toContainEqual({
						to: targetSquare,
						isEnPassantCapture: true
					});
				});

				test('When target square is empty and adjacent square is empty, Then it should not include en passant capture', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						enPassantTarget: targetSquare
					});
					expect(moves).not.toContainEqual({
						to: targetSquare,
						isEnPassantCapture: true
					});
				});

				test('When target square is empty and adjacent has same side pawn, Then it should not include en passant capture', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						extras: { [adjacentSquare]: { type: 'pawn', side: 'w' } },
						enPassantTarget: targetSquare
					});
					expect(moves).not.toContainEqual({
						to: targetSquare,
						isEnPassantCapture: true
					});
				});

				test('When target square is empty and adjacent has enemy non-pawn, Then it should not include en passant capture', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						extras: { [adjacentSquare]: { type: 'knight', side: 'b' } },
						enPassantTarget: targetSquare
					});
					expect(moves).not.toContainEqual({
						to: targetSquare,
						isEnPassantCapture: true
					});
				});

				test('When target square has enemy piece, Then it should not include en passant capture', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						extras: {
							[targetSquare]: { type: 'pawn', side: 'b' },
							[adjacentSquare]: { type: 'pawn', side: 'b' }
						},
						enPassantTarget: targetSquare
					});
					expect(moves).not.toContainEqual({
						to: targetSquare,
						isEnPassantCapture: true
					});
				});

				test('When target square has same side piece, Then it should not include en passant capture', () => {
					const moves = subject({
						pawnSquare: 'e5',
						side: 'w',
						extras: {
							[targetSquare]: { type: 'pawn', side: 'w' },
							[adjacentSquare]: { type: 'pawn', side: 'b' }
						},
						enPassantTarget: targetSquare
					});
					expect(moves).not.toContainEqual({
						to: targetSquare,
						isEnPassantCapture: true
					});
				});
			}
		);

		test('Given en passant target is not this pawn diagonal, When moves are generated, Then it should not include en passant capture', () => {
			const moves = subject({
				pawnSquare: 'e5',
				side: 'w',
				extras: { d5: { type: 'pawn', side: 'b' } },
				enPassantTarget: 'f6'
			});

			expect(moves).not.toContainEqual({
				to: 'd6',
				isEnPassantCapture: true
			});
		});
	});

});
