import { describe, test } from 'vitest';

describe('Given parsing a FEN string', () => {
	test.todo('When FEN has fewer than 6 fields, Then it should throw an invalid FEN error');
	test.todo('When FEN has more than 6 fields, Then it should throw an invalid FEN error');
	test.todo('When piece placement has invalid rank lengths, Then it should throw');
	test.todo('When piece placement contains invalid characters, Then it should throw');
	test.todo('When parsing piece placement, Then it should map all pieces to correct squares');
	test.todo('When parsing side to move, Then it should map w and b correctly');
	test.todo('When parsing castling availability, Then it should handle KQkq and -');
	test.todo('When parsing en passant target square, Then it should handle valid targets and -');
	test.todo('When parsing halfmove clock, Then it should accept non-negative integers');
	test.todo('When parsing fullmove counter, Then it should require values >= 1');
	test.todo('When parsing a valid FEN string, Then it should return the expected board state');
});

describe('Given serializing a board state to FEN', () => {
	// TODO: import serializeFenString from `src/lib/game/fen.svelte.ts` once created.

	test.todo(
		'When serializing a valid board state, Then it should produce a valid 6-field FEN string'
	);
});
