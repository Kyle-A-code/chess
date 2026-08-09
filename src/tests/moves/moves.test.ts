import { beforeEach, describe, expect, test } from 'vitest';
import { findKingSquareForSide, isActiveSideInCheck, processMove } from '../../lib/moves/moves';
import type { BoardState, Piece, PiecePlacement } from '../../lib/types';
import { createBoardState } from '../helpers/createBoardState';

describe('Given finding king square for side', () => {
	test('When white king exists, Then it should return white king square', () => {
		const piecePlacement: PiecePlacement = {
			e1: { type: 'king', side: 'w' },
			e8: { type: 'king', side: 'b' },
			d1: { type: 'queen', side: 'w' }
		};
		const boardState = createBoardState(piecePlacement);

		expect(findKingSquareForSide(boardState, 'w')).toBe('e1');
	});

	test('When black king exists, Then it should return black king square', () => {
		const piecePlacement: PiecePlacement = {
			e1: { type: 'king', side: 'w' },
			e8: { type: 'king', side: 'b' },
			d8: { type: 'queen', side: 'b' }
		};
		const boardState = createBoardState(piecePlacement, { activeSide: 'b' });

		expect(findKingSquareForSide(boardState, 'b')).toBe('e8');
	});

	test('When requested side king does not exist, Then it should return undefined', () => {
		const piecePlacement: PiecePlacement = {
			e1: { type: 'king', side: 'w' },
			d8: { type: 'queen', side: 'b' }
		};
		const boardState = createBoardState(piecePlacement);

		expect(findKingSquareForSide(boardState, 'b')).toBeUndefined();
	});
});

describe('Given checking whether active side is in check', () => {
	test('When active side king is attacked, Then it should return true', () => {
		const boardState = createBoardState({
			e1: { type: 'king', side: 'w' },
			e8: { type: 'rook', side: 'b' }
		});

		expect(isActiveSideInCheck(boardState, 'e1')).toBe(true);
	});

	test('When active side king is not attacked, Then it should return false', () => {
		const boardState = createBoardState({
			e1: { type: 'king', side: 'w' },
			e8: { type: 'rook', side: 'b' },
			e4: { type: 'bishop', side: 'w' }
		});

		expect(isActiveSideInCheck(boardState, 'e1')).toBe(false);
	});
});

describe.skip('Given generating legal moves', () => {
	test('When legal move tests are implemented, Then this suite should cover key legal move scenarios', () => {});
});

describe('Given processing a move', () => {
	let boardState: BoardState;

	beforeEach(() => {
		boardState = createBoardState({});
	});

	test('When selected piece is missing, Then it should throw selected piece error', () => {
		expect(() => processMove(boardState, { to: 'e4' }, 'e2')).toThrow('Selected piece not found');
	});

	test('When a piece moves, Then it should clear origin square and place piece on destination square', () => {
		boardState.piecePlacement.g1 = { type: 'knight', side: 'w' };

		processMove(boardState, { to: 'f3' }, 'g1');

		expect(boardState.piecePlacement.g1).toBeUndefined();
		expect(boardState.piecePlacement.f3).toEqual({ type: 'knight', side: 'w' });
	});

	test('When destination has enemy piece, Then it should replace destination piece with moved piece', () => {
		const capturedPiece: Piece = { type: 'rook', side: 'b' };
		boardState.piecePlacement.d1 = { type: 'queen', side: 'w' };
		boardState.piecePlacement.d8 = capturedPiece;

		processMove(boardState, { to: 'd8' }, 'd1');

		expect(boardState.piecePlacement.d1).toBeUndefined();
		expect(boardState.piecePlacement.d8).toEqual({ type: 'queen', side: 'w' });
		expect(Object.values(boardState.piecePlacement).every((piece) => piece !== capturedPiece)).toBe(
			true
		);
	});

	describe('Given en passant side effects', () => {
		test('When any move is processed, Then it should clear existing en passant target before side effects', () => {
			boardState.enPassantTarget = 'd6';
			boardState.piecePlacement.g1 = { type: 'knight', side: 'w' };

			processMove(boardState, { to: 'f3' }, 'g1');

			expect(boardState.enPassantTarget).toBeUndefined();
		});

		test('When pawn moves two squares, Then it should set new en passant target', () => {
			boardState.piecePlacement.e2 = { type: 'pawn', side: 'w' };

			processMove(boardState, { to: 'e4', enPassantTarget: 'e3' }, 'e2');

			expect(boardState.enPassantTarget).toBe('e3');
		});

		test('When pawn move is en passant capture, Then it should remove captured pawn from capture square', () => {
			boardState.piecePlacement.e5 = { type: 'pawn', side: 'w' };
			boardState.piecePlacement.d5 = { type: 'pawn', side: 'b' };

			processMove(boardState, { to: 'd6', enPassantCapture: 'd5' }, 'e5');

			expect(boardState.piecePlacement.d6).toEqual({ type: 'pawn', side: 'w' });
			expect(boardState.piecePlacement.d5).toBeUndefined();
		});
	});

	describe('Given promotion side effects', () => {
		test('When pawn move is a promotion, Then it should place a queen on destination square', () => {
			boardState.piecePlacement.e7 = { type: 'pawn', side: 'w' };

			processMove(boardState, { to: 'e8', isPromotion: true }, 'e7');

			expect(boardState.piecePlacement.e8).toEqual({ type: 'queen', side: 'w' });
		});
	});

	describe('Given castling side effects', () => {
		describe('Given castling side effects from rook movement', () => {
			describe('When rook moves from a1', () => {
				test('Given white queenside castling availability is present, Then it should remove Q', () => {
					boardState.castlingAvailability = 'KQkq';
					boardState.piecePlacement.a1 = { type: 'rook', side: 'w' };

					processMove(boardState, { to: 'a3' }, 'a1');

					expect(boardState.castlingAvailability).toBe('Kkq');
				});

				test('Given white queenside castling availability is absent, Then it should keep castlingAvailability unchanged', () => {
					boardState.castlingAvailability = 'Kkq';
					boardState.piecePlacement.a1 = { type: 'rook', side: 'w' };

					processMove(boardState, { to: 'a3' }, 'a1');

					expect(boardState.castlingAvailability).toBe('Kkq');
				});
			});

			describe('When rook moves from h1', () => {
				test('Given white kingside castling availability is present, Then it should remove K', () => {
					boardState.castlingAvailability = 'KQkq';
					boardState.piecePlacement.h1 = { type: 'rook', side: 'w' };

					processMove(boardState, { to: 'h3' }, 'h1');

					expect(boardState.castlingAvailability).toBe('Qkq');
				});

				test('Given white kingside castling availability is absent, Then it should keep castlingAvailability unchanged', () => {
					boardState.castlingAvailability = 'Qkq';
					boardState.piecePlacement.h1 = { type: 'rook', side: 'w' };

					processMove(boardState, { to: 'h3' }, 'h1');

					expect(boardState.castlingAvailability).toBe('Qkq');
				});
			});

			describe('When rook moves from a8', () => {
				test('Given black queenside castling availability is present, Then it should remove q', () => {
					boardState.castlingAvailability = 'KQkq';
					boardState.piecePlacement.a8 = { type: 'rook', side: 'b' };

					processMove(boardState, { to: 'a6' }, 'a8');

					expect(boardState.castlingAvailability).toBe('KQk');
				});

				test('Given black queenside castling availability is absent, Then it should keep castlingAvailability unchanged', () => {
					boardState.castlingAvailability = 'KQk';
					boardState.piecePlacement.a8 = { type: 'rook', side: 'b' };

					processMove(boardState, { to: 'a6' }, 'a8');

					expect(boardState.castlingAvailability).toBe('KQk');
				});
			});

			describe('When rook moves from h8', () => {
				test('Given black kingside castling availability is present, Then it should remove k', () => {
					boardState.castlingAvailability = 'KQkq';
					boardState.piecePlacement.h8 = { type: 'rook', side: 'b' };

					processMove(boardState, { to: 'h6' }, 'h8');

					expect(boardState.castlingAvailability).toBe('KQq');
				});

				test('Given black kingside castling availability is absent, Then it should keep castlingAvailability unchanged', () => {
					boardState.castlingAvailability = 'KQq';
					boardState.piecePlacement.h8 = { type: 'rook', side: 'b' };

					processMove(boardState, { to: 'h6' }, 'h8');

					expect(boardState.castlingAvailability).toBe('KQq');
				});
			});
		});

		test('When white king moves, Then it should remove white castling availability', () => {
			boardState.castlingAvailability = 'KQkq';
			boardState.piecePlacement.e1 = { type: 'king', side: 'w' };

			processMove(boardState, { to: 'e2' }, 'e1');

			expect(boardState.castlingAvailability).toBe('kq');
		});

		test('When black king moves, Then it should remove black castling availability', () => {
			boardState.castlingAvailability = 'KQkq';
			boardState.activeSide = 'b';
			boardState.piecePlacement.e8 = { type: 'king', side: 'b' };

			processMove(boardState, { to: 'e7' }, 'e8');

			expect(boardState.castlingAvailability).toBe('KQ');
		});

		test('When white king castles kingside, Then it should move rook to f1', () => {
			boardState.castlingAvailability = 'KQkq';
			boardState.piecePlacement.e1 = { type: 'king', side: 'w' };
			boardState.piecePlacement.h1 = { type: 'rook', side: 'w' };

			processMove(boardState, { to: 'g1', isCastlingKingside: true }, 'e1');

			expect(boardState.piecePlacement.h1).toBeUndefined();
			expect(boardState.piecePlacement.f1).toEqual({ type: 'rook', side: 'w' });
			expect(boardState.castlingAvailability).toBe('kq');
		});

		test('When white king castles queenside, Then it should move rook to d1', () => {
			boardState.castlingAvailability = 'KQkq';
			boardState.piecePlacement.e1 = { type: 'king', side: 'w' };
			boardState.piecePlacement.a1 = { type: 'rook', side: 'w' };

			processMove(boardState, { to: 'c1', isCastlingQueenside: true }, 'e1');

			expect(boardState.piecePlacement.a1).toBeUndefined();
			expect(boardState.piecePlacement.d1).toEqual({ type: 'rook', side: 'w' });
			expect(boardState.castlingAvailability).toBe('kq');
		});

		test('When black king castles kingside, Then it should move rook to f8', () => {
			boardState.castlingAvailability = 'KQkq';
			boardState.activeSide = 'b';
			boardState.piecePlacement.e8 = { type: 'king', side: 'b' };
			boardState.piecePlacement.h8 = { type: 'rook', side: 'b' };

			processMove(boardState, { to: 'g8', isCastlingKingside: true }, 'e8');

			expect(boardState.piecePlacement.h8).toBeUndefined();
			expect(boardState.piecePlacement.f8).toEqual({ type: 'rook', side: 'b' });
			expect(boardState.castlingAvailability).toBe('KQ');
		});

		test('When black king castles queenside, Then it should move rook to d8', () => {
			boardState.castlingAvailability = 'KQkq';
			boardState.activeSide = 'b';
			boardState.piecePlacement.e8 = { type: 'king', side: 'b' };
			boardState.piecePlacement.a8 = { type: 'rook', side: 'b' };

			processMove(boardState, { to: 'c8', isCastlingQueenside: true }, 'e8');

			expect(boardState.piecePlacement.a8).toBeUndefined();
			expect(boardState.piecePlacement.d8).toEqual({ type: 'rook', side: 'b' });
			expect(boardState.castlingAvailability).toBe('KQ');
		});
	});

	describe('Given half move clock updates', () => {
		test('When moved piece is a pawn, Then it should reset half move clock', () => {
			boardState.halfMoveClock = 12;
			boardState.piecePlacement.e2 = { type: 'pawn', side: 'w' };

			processMove(boardState, { to: 'e3' }, 'e2');

			expect(boardState.halfMoveClock).toBe(0);
		});

		test('When move captures a piece, Then it should reset half move clock', () => {
			boardState.halfMoveClock = 12;
			boardState.piecePlacement.d1 = { type: 'queen', side: 'w' };
			boardState.piecePlacement.d8 = { type: 'rook', side: 'b' };

			processMove(boardState, { to: 'd8' }, 'd1');

			expect(boardState.halfMoveClock).toBe(0);
		});

		test('When move is en passant capture, Then it should reset half move clock', () => {
			boardState.halfMoveClock = 12;
			boardState.piecePlacement.e5 = { type: 'pawn', side: 'w' };
			boardState.piecePlacement.d5 = { type: 'pawn', side: 'b' };

			processMove(boardState, { to: 'd6', enPassantCapture: 'd5' }, 'e5');

			expect(boardState.halfMoveClock).toBe(0);
		});

		test('When move is a quiet non-pawn move, Then it should increment half move clock', () => {
			boardState.halfMoveClock = 12;
			boardState.piecePlacement.g1 = { type: 'knight', side: 'w' };

			processMove(boardState, { to: 'f3' }, 'g1');

			expect(boardState.halfMoveClock).toBe(13);
		});
	});
});
