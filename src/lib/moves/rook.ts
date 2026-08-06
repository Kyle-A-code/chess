import { squareToFileRank, type Square } from '../game/boardPrimitives';
import type { BoardState, Move } from '../types';
import { getOrthogonalMoves } from './helpers/orthogonals';

const WHITE_LEFT_STARTING_SQUARE = 'a1';
const WHITE_RIGHT_STARTING_SQUARE = 'h1';
const BLACK_LEFT_STARTING_SQUARE = 'a8';
const BLACK_RIGHT_STARTING_SQUARE = 'h8';

export const pseudoLegalRookMoves = (boardState: BoardState, square: Square) => {
	const [file, rank] = squareToFileRank(square);
	const piece = boardState.piecePlacement[square];
	if (piece?.type !== 'rook') throw new Error('Tile is not a rook');
	const side = piece.side;
	return getOrthogonalMoves(boardState, side, file, rank);
};

export const handleRookSideEffects = (boardState: BoardState, square: Square) => {
	if (boardState.castlingAvailability === undefined || boardState.castlingAvailability === '')
		return;

	if (square === WHITE_LEFT_STARTING_SQUARE && boardState.castlingAvailability.includes('Q')) {
		boardState.castlingAvailability = boardState.castlingAvailability.replace('Q', '');
	}
	if (square === WHITE_RIGHT_STARTING_SQUARE && boardState.castlingAvailability.includes('K')) {
		boardState.castlingAvailability = boardState.castlingAvailability.replace('K', '');
	}
	if (square === BLACK_LEFT_STARTING_SQUARE && boardState.castlingAvailability.includes('q')) {
		boardState.castlingAvailability = boardState.castlingAvailability.replace('q', '');
	}
	if (square === BLACK_RIGHT_STARTING_SQUARE && boardState.castlingAvailability.includes('k')) {
		boardState.castlingAvailability = boardState.castlingAvailability.replace('k', '');
	}
};
