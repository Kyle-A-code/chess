import type { PieceType, Square } from "./game/boardPrimitives";

export type Side = 'w' | 'b';

export interface Tile {
	id: Square;
	colour: Side;
	piece?: Piece;
}

export interface Piece {
	type: PieceType
	side: Side;
}

export type PiecePlacement = Partial<Record<Square, Piece | undefined>>;

export interface BoardState {
	piecePlacement: PiecePlacement;
	activeSide: Side;
	castlingAvailability?: string;
	enPassantTarget?: Square;
	halfMoveClock: number;
	fullMoveNumber: number;
}
