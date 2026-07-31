import { beforeEach, describe, expect, test } from 'vitest';
import { processPawnMove, pseudoLegalPawnMoves } from '../../lib/moves/pawn';
import type { BoardState, PiecePlacement, Side, Tile } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';

const createBoardState = (
	piecePlacement: PiecePlacement,
	enPassantTarget?: Square,
	activeSide: Side = 'w'
): BoardState => ({
	piecePlacement,
	activeSide,
	enPassantTarget,
	halfMoveClock: 0,
	fullMoveNumber: 1
});

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
	return pseudoLegalPawnMoves(boardState, pawnSquare);
};

describe('Given an invalid tile is provided', () => {
	const boardState = createBoardState({ ['e2']: { type: 'rook', side: 'w' } });
	test('When tile piece is not a pawn, Then it should throw tile is not a pawn', () => {
		expect(() => pseudoLegalPawnMoves(boardState, 'e2')).toThrow('Tile is not a pawn');
	});

	test('When tile id is invalid, Then it should throw invalid tile', () => {
		// @ts-expect-error testing runtime guard for invalid tile id
		expect(() => pseudoLegalPawnMoves(boardState, 'z9')).toThrow('Invalid tile');
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
								enPassantTarget: oneStepSquare
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
								enPassantTarget: oneStepSquare
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
								enPassantTarget: oneStepSquare
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
						enPassantCapture: adjacentSquare
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
						enPassantCapture: adjacentSquare
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
						enPassantCapture: adjacentSquare
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
						enPassantCapture: adjacentSquare
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
						enPassantCapture: adjacentSquare
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
						enPassantCapture: adjacentSquare
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
				enPassantCapture: 'd5'
			});
		});
	});
});

describe('Given processing pawn move side effects', () => {
	let boardState: BoardState;

	beforeEach(() => {
		boardState = createBoardState({});
	});

	test('When move includes an en passant target, Then it should set the board en passant target', () => {
		processPawnMove(boardState, { to: 'e4', enPassantTarget: 'e3' });
		expect(boardState.enPassantTarget).toBe('e3');
	});

	test('When move omits an en passant target, Then it should keep the existing board en passant target', () => {
		boardState.enPassantTarget = 'd6';
		processPawnMove(boardState, { to: 'e4' });
		expect(boardState.enPassantTarget).toBe('d6');
	});

	test('When move is a promotion for white side to move, Then it should place a white queen on destination square', () => {
		processPawnMove(boardState, { to: 'e8', isPromotion: true });
		expect(boardState.piecePlacement.e8).toEqual({ type: 'queen', side: 'w' });
	});

	test('When move is a promotion for black side to move, Then it should place a black queen on destination square', () => {
		boardState = createBoardState({}, undefined, 'b');
		processPawnMove(boardState, { to: 'e1', isPromotion: true });
		expect(boardState.piecePlacement.e1).toEqual({ type: 'queen', side: 'b' });
	});

	test('When move is not a promotion, Then it should not replace destination square with a queen', () => {
		boardState.piecePlacement.e5 = { type: 'rook', side: 'b' };
		processPawnMove(boardState, { to: 'e5' });
		expect(boardState.piecePlacement.e5).toEqual({ type: 'rook', side: 'b' });
	});

	test('When move includes en passant capture square, Then it should remove the captured pawn square', () => {
		boardState.piecePlacement.d5 = { type: 'pawn', side: 'b' };
		processPawnMove(boardState, { to: 'd6', enPassantCapture: 'd5' });
		expect(boardState.piecePlacement.d5).toBeUndefined();
	});

	test('When move omits en passant capture square, Then it should keep adjacent pieces unchanged', () => {
		boardState.piecePlacement.d5 = { type: 'pawn', side: 'b' };
		processPawnMove(boardState, { to: 'd6' });
		expect(boardState.piecePlacement.d5).toEqual({ type: 'pawn', side: 'b' });
	});
});
