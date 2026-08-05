import { squareToFileRank, type Square } from "../game/boardPrimitives";
import type { BoardState } from "../types";
import { getDiagonalMoves } from "./helpers/diagonals";

export const pseudoLegalBishopMoves = (boardState: BoardState, square: Square) => {
	const [file, rank] = squareToFileRank(square);
	const piece = boardState.piecePlacement[square];
	if (piece?.type !== 'bishop') throw new Error('Tile is not a bishop');
	const side = piece.side;
	return getDiagonalMoves(boardState, side, file, rank);
};