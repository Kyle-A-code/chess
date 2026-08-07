import type { PieceType, Square } from './game/boardPrimitives';

export type Side = 'w' | 'b';

export interface Tile {
	id: Square;
	colour: Side;
	piece?: Piece;
}

export interface Piece {
	type: PieceType;
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

export interface BaseMove {
	to: Square;
}

export interface PawnMove extends BaseMove {
	isPromotion?: boolean;
	enPassantTarget?: Square;
	enPassantCapture?: Square;
}

export interface KingMove extends BaseMove {
	isPromotion?: boolean;
	isCastlingQueenside?: boolean;
	isCastlingKingside?: boolean;
}

export type Move = BaseMove | PawnMove | KingMove;

export type Moves = Partial<Record<Square, Move[]>>;
