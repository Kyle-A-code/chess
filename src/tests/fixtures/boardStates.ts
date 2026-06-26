import type { BoardState } from '../../lib/types';

export const START_FEN =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const START_BOARD_STATE: BoardState = {
	piecePlacement: {
		a1: { type: 'rook', side: 'w' },
		b1: { type: 'knight', side: 'w' },
		c1: { type: 'bishop', side: 'w' },
		d1: { type: 'queen', side: 'w' },
		e1: { type: 'king', side: 'w' },
		f1: { type: 'bishop', side: 'w' },
		g1: { type: 'knight', side: 'w' },
		h1: { type: 'rook', side: 'w' },
		a2: { type: 'pawn', side: 'w' },
		b2: { type: 'pawn', side: 'w' },
		c2: { type: 'pawn', side: 'w' },
		d2: { type: 'pawn', side: 'w' },
		e2: { type: 'pawn', side: 'w' },
		f2: { type: 'pawn', side: 'w' },
		g2: { type: 'pawn', side: 'w' },
		h2: { type: 'pawn', side: 'w' },
		a7: { type: 'pawn', side: 'b' },
		b7: { type: 'pawn', side: 'b' },
		c7: { type: 'pawn', side: 'b' },
		d7: { type: 'pawn', side: 'b' },
		e7: { type: 'pawn', side: 'b' },
		f7: { type: 'pawn', side: 'b' },
		g7: { type: 'pawn', side: 'b' },
		h7: { type: 'pawn', side: 'b' },
		a8: { type: 'rook', side: 'b' },
		b8: { type: 'knight', side: 'b' },
		c8: { type: 'bishop', side: 'b' },
		d8: { type: 'queen', side: 'b' },
		e8: { type: 'king', side: 'b' },
		f8: { type: 'bishop', side: 'b' },
		g8: { type: 'knight', side: 'b' },
		h8: { type: 'rook', side: 'b' }
	},
	activeSide: 'w',
	castlingAvailability: 'KQkq',
	enPassantTarget: undefined,
	halfMoveClock: 0,
	fullMoveNumber: 1
};

export const BLACK_TO_MOVE_FEN =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';

export const MIDGAME_FEN =
	'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';

export const MIDGAME_BOARD_STATE: BoardState = {
	piecePlacement: {
		a1: { type: 'rook', side: 'w' },
		b1: { type: 'knight', side: 'w' },
		c1: { type: 'bishop', side: 'w' },
		d1: { type: 'queen', side: 'w' },
		e1: { type: 'king', side: 'w' },
		f1: { type: 'bishop', side: 'w' },
		g1: { type: 'knight', side: 'w' },
		h1: { type: 'rook', side: 'w' },
		a2: { type: 'pawn', side: 'w' },
		b2: { type: 'pawn', side: 'w' },
		c2: { type: 'pawn', side: 'w' },
		d2: { type: 'pawn', side: 'w' },
		f2: { type: 'pawn', side: 'w' },
		g2: { type: 'pawn', side: 'w' },
		h2: { type: 'pawn', side: 'w' },
		e4: { type: 'pawn', side: 'w' },
		a7: { type: 'pawn', side: 'b' },
		b7: { type: 'pawn', side: 'b' },
		c7: { type: 'pawn', side: 'b' },
		d7: { type: 'pawn', side: 'b' },
		f7: { type: 'pawn', side: 'b' },
		g7: { type: 'pawn', side: 'b' },
		h7: { type: 'pawn', side: 'b' },
		e5: { type: 'pawn', side: 'b' },
		a8: { type: 'rook', side: 'b' },
		b8: { type: 'knight', side: 'b' },
		c8: { type: 'bishop', side: 'b' },
		d8: { type: 'queen', side: 'b' },
		e8: { type: 'king', side: 'b' },
		f8: { type: 'bishop', side: 'b' },
		g8: { type: 'knight', side: 'b' },
		h8: { type: 'rook', side: 'b' }
	},
	activeSide: 'w',
	castlingAvailability: 'KQkq',
	enPassantTarget: 'e6',
	halfMoveClock: 0,
	fullMoveNumber: 2
};

export const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

export const EMPTY_BOARD_STATE: BoardState = {
	piecePlacement: {},
	activeSide: 'w',
	castlingAvailability: undefined,
	enPassantTarget: undefined,
	halfMoveClock: 0,
	fullMoveNumber: 1
};

export const VALID_FENS = [START_FEN, MIDGAME_FEN, EMPTY_FEN] as const;

export const INVALID_FEN_TOO_FEW_FIELDS =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0';

export const INVALID_FEN_TOO_MANY_FIELDS =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 extra';

export const INVALID_FEN_WRONG_RANK_COUNT = '8/8/8/8/8/8/8 w KQkq - 0 1';

export const INVALID_FEN_RANK_TOO_LONG =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNRR w KQkq - 0 1';

export const INVALID_FEN_RANK_TOO_SHORT =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN w KQkq - 0 1';

export const INVALID_FEN_INVALID_PIECE =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/xNBQKBNR w KQkq - 0 1';

export const INVALID_FEN_INVALID_SIDE =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1';

export const INVALID_FEN_INVALID_CASTLING =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w qK - 0 1';

export const INVALID_FEN_INVALID_EN_PASSANT =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq d4 0 1';

export const INVALID_FEN_NEGATIVE_HALFMOVE =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1';

export const INVALID_FEN_ZERO_FULLMOVE =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0';

export const HALFMOVE_FEN_15 =
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 15 1';