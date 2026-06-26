import { describe, expect, test, beforeEach } from 'vitest';
import { fenToBoardState, boardStateToFen } from '../../lib/game/fen';
import type { BoardState } from '../../lib/types';
import {
	BLACK_TO_MOVE_FEN,
	EMPTY_BOARD_STATE,
	EMPTY_FEN,
	HALFMOVE_FEN_15,
	INVALID_FEN_TOO_FEW_FIELDS,
	INVALID_FEN_TOO_MANY_FIELDS,
	INVALID_FEN_WRONG_RANK_COUNT,
	INVALID_FEN_RANK_TOO_LONG,
	INVALID_FEN_RANK_TOO_SHORT,
	INVALID_FEN_INVALID_PIECE,
	INVALID_FEN_INVALID_SIDE,
	INVALID_FEN_INVALID_CASTLING,
	INVALID_FEN_INVALID_EN_PASSANT,
	INVALID_FEN_NEGATIVE_HALFMOVE,
	INVALID_FEN_ZERO_FULLMOVE,
	MIDGAME_BOARD_STATE,
	MIDGAME_FEN,
	START_BOARD_STATE,
	START_FEN,
	VALID_FENS
} from '../fixtures/boardStates';

const INVALID_FEN_CASES = [
	['too few fields', INVALID_FEN_TOO_FEW_FIELDS],
	['too many fields', INVALID_FEN_TOO_MANY_FIELDS],
	['wrong rank count', INVALID_FEN_WRONG_RANK_COUNT],
	['rank too long', INVALID_FEN_RANK_TOO_LONG],
	['rank too short', INVALID_FEN_RANK_TOO_SHORT],
	['invalid piece character', INVALID_FEN_INVALID_PIECE],
	['invalid side to move', INVALID_FEN_INVALID_SIDE],
	['invalid castling availability', INVALID_FEN_INVALID_CASTLING],
	['invalid en passant target', INVALID_FEN_INVALID_EN_PASSANT],
	['negative halfmove clock', INVALID_FEN_NEGATIVE_HALFMOVE],
	['zero full move number', INVALID_FEN_ZERO_FULLMOVE]
] as const;

describe('Given deserialising a FEN string to a board state', () => {
	test.each(INVALID_FEN_CASES)(
		'When FEN is invalid due to %s, Then it should throw',
		(_reason, fen) => {
			expect(() => fenToBoardState(fen)).toThrow();
		}
	);

	test('When parsing piece placement, Then it should map all pieces to correct squares', () => {
		expect(fenToBoardState(START_FEN).piecePlacement).toEqual(START_BOARD_STATE.piecePlacement);
	});

	test('When parsing side to move as w, Then it should return w', () => {
		expect(fenToBoardState(START_FEN).activeSide).toBe('w');
	});

	test('When parsing side to move as b, Then it should return b', () => {
		expect(fenToBoardState(BLACK_TO_MOVE_FEN).activeSide).toBe('b');
	});

	test('When parsing castling availability with KQkq, Then it should return the castling string', () => {
		expect(fenToBoardState(START_FEN).castlingAvailability).toBe('KQkq');
	});

	test('When parsing castling availability with -, Then it should return undefined', () => {
		expect(fenToBoardState(EMPTY_FEN).castlingAvailability).toBeUndefined();
	});

	test('When parsing en passant target with a valid square, Then it should return the square', () => {
		expect(fenToBoardState(MIDGAME_FEN).enPassantTarget).toBe('e6');
	});

	test('When parsing en passant target with -, Then it should return undefined', () => {
		expect(fenToBoardState(START_FEN).enPassantTarget).toBeUndefined();
	});

	test('When parsing halfmove clock as 0, Then it should return 0', () => {
		expect(fenToBoardState(START_FEN).halfMoveClock).toBe(0);
	});

	test('When parsing halfmove clock as a positive integer, Then it should return the value', () => {
		expect(fenToBoardState(HALFMOVE_FEN_15).halfMoveClock).toBe(15);
	});

	test('When parsing fullmove counter as 1, Then it should return 1', () => {
		expect(fenToBoardState(START_FEN).fullMoveNumber).toBe(1);
	});

	test('When parsing fullmove counter greater than 1, Then it should return the value', () => {
		expect(fenToBoardState(MIDGAME_FEN).fullMoveNumber).toBe(2);
	});

	test('When parsing a valid FEN string, Then it should return the expected board state', () => {
		expect(fenToBoardState(START_FEN)).toEqual(START_BOARD_STATE);
		expect(fenToBoardState(MIDGAME_FEN)).toEqual(MIDGAME_BOARD_STATE);
		expect(fenToBoardState(EMPTY_FEN)).toEqual(EMPTY_BOARD_STATE);
	});

	test('When FEN has leading and trailing whitespace, Then it should parse the same as trimmed FEN', () => {
		expect(fenToBoardState(`  ${START_FEN}  `)).toEqual(START_BOARD_STATE);
	});
});

describe('Given serialising a board state to a FEN string', () => {
	let boardState: BoardState;
	beforeEach(() => {
		boardState = structuredClone(START_BOARD_STATE);
	});

	test('When serialising a valid board state, Then it should produce a valid FEN string', () => {
		expect(boardStateToFen(boardState)).toBe(START_FEN);
	});

	test('When serialising a non start state to a FEN string, Then it should produce a valid FEN string', () => {
		expect(boardStateToFen(MIDGAME_BOARD_STATE)).toBe(MIDGAME_FEN);
	});

	test('When the board state has an undefined castling availability, Then it should produce a valid FEN string', () => {
		expect(boardStateToFen(EMPTY_BOARD_STATE)).toBe(EMPTY_FEN);
	});

	test('When the board state has an undefined en passant target, Then it should produce a valid FEN string', () => {
		expect(boardStateToFen(START_BOARD_STATE)).toBe(START_FEN);
		expect(boardStateToFen(START_BOARD_STATE).split(' ')[3]).toBe('-');
	});

	test('When serialising a board state with an invalid side to move, Then it should throw an invalid FEN error', () => {
		// @ts-expect-error
		boardState.activeSide = 'invalid';
		expect(() => boardStateToFen(boardState)).toThrow('Invalid side: invalid');
	});

	test('When serialising a board state with an invalid castling availability, Then it should throw an invalid FEN error', () => {
		boardState.castlingAvailability = 'invalid';
		expect(() => boardStateToFen(boardState)).toThrow('Invalid castling: invalid');
	});

	test('When serialising a board state with an out of order castling availability, Then it should throw an invalid FEN error', () => {
		boardState.castlingAvailability = 'kqKQ';
		expect(() => boardStateToFen(boardState)).toThrow('Invalid castling: kqKQ');
	});

	test('When serialising a board state with an invalid en passant target, Then it should throw an invalid FEN error', () => {
		boardState.enPassantTarget = 'd4';
		expect(() => boardStateToFen(boardState)).toThrow('Invalid en passant target: d4');
	});

	test('When serialising a board state with an out of order en passant target, Then it should throw an invalid FEN error', () => {
		boardState.enPassantTarget = '3d';
		expect(() => boardStateToFen(boardState)).toThrow('Invalid en passant target: 3d');
	});

	test('When serialising a board state with an invalid halfmove clock, Then it should throw an invalid FEN error', () => {
		boardState.halfMoveClock = -1;
		expect(() => boardStateToFen(boardState)).toThrow('Invalid half move clock: -1');
	});

	test('When serialising a board state with an undefined halfmove clock, Then it should throw', () => {
		// @ts-expect-error
		boardState.halfMoveClock = undefined;
		expect(() => boardStateToFen(boardState)).toThrow();
	});

	test('When serialising a board state with an invalid fullmove number, Then it should throw an invalid FEN error', () => {
		boardState.fullMoveNumber = 0;
		expect(() => boardStateToFen(boardState)).toThrow('Invalid full move number: 0');
	});

	test('When serialising a board state with an undefined fullmove number, Then it should throw', () => {
		// @ts-expect-error
		boardState.fullMoveNumber = undefined;
		expect(() => boardStateToFen(boardState)).toThrow();
	});

	test('When serialising a board state with an invalid piece type, Then it should throw', () => {
		const invalidBoardState = structuredClone(START_BOARD_STATE);
		// @ts-expect-error
		invalidBoardState.piecePlacement.e1 = { type: 'invalid', side: 'w' };
		expect(() => boardStateToFen(invalidBoardState)).toThrow('Invalid piece type: invalid');
	});

	test('When serialising a board state with an invalid piece side, Then it should throw', () => {
		const invalidBoardState = structuredClone(START_BOARD_STATE);
		// @ts-expect-error
		invalidBoardState.piecePlacement.e1 = { type: 'pawn', side: 'invalid' };
		expect(() => boardStateToFen(invalidBoardState)).toThrow('Invalid side: invalid');
	});
});

describe('Given round-tripping FEN and board state', () => {
	test('When round-tripping all valid FEN fixtures, Then FEN is unchanged', () => {
		for (const fen of VALID_FENS) {
			expect(boardStateToFen(fenToBoardState(fen))).toBe(fen);
		}
	});
});
