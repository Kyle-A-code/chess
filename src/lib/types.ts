export type Side = 'w' | 'b';

export interface Tile {
	id: string;
	colour: Side;
	piece?: Piece;
}

export interface Piece {
	type: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
	side: Side;
}

export type PiecePlacement = Record<string, Piece | undefined>;

export interface BoardState {
	piecePlacement: PiecePlacement;
	activeSide: Side;
	castlingAvailability?: string;
	enPassantTarget?: string;
	halfMoveClock: number;
	fullMoveNumber: number;
}
