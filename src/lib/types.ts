export type Side = 'light' | 'dark';

export interface Tile {
	id: string;
	colour: Side;
	piece?: Piece;
}

export interface Piece {
	type: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
	side: Side;
}

export type BoardState = Record<string, Piece | undefined>;
