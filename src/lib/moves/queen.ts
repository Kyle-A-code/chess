import { squareToFileRank, type Square } from '../game/boardPrimitives';
import type { BoardState } from '../types';
import { getDiagonalMoves } from './helpers/diagonals';
import { getOrthogonalMoves } from './helpers/orthogonals';

export const pseudoLegalQueenMoves = (boardState: BoardState, square: Square) => {
	const [file, rank] = squareToFileRank(square);
	const piece = boardState.piecePlacement[square];
	if (piece?.type !== 'queen') throw new Error('Tile is not a queen');
	const side = piece.side;
	return [
		...getDiagonalMoves(boardState, side, file, rank),
		...getOrthogonalMoves(boardState, side, file, rank)
	];
};
