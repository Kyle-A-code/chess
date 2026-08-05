import { pseudoLegalKnightMoves } from '../moves/knight';
import { pseudoLegalBishopMoves } from '../moves/bishop';
import {  pseudoLegalPawnMoves } from '../moves/pawn';
import { isSquare } from '../game/boardPrimitives';
import type { BoardState, PseudoLegalMoves } from '../types';


export const getPseudoLegalMoves = (boardState: BoardState): PseudoLegalMoves => {
	const pseudoLegalMoves: PseudoLegalMoves = {};
	Object.entries(boardState.piecePlacement).forEach(([square, piece]) => {
		if (piece === undefined || !isSquare(square) || piece.side !== boardState.activeSide) {
			return;
		}
		switch (piece.type) {
			case 'pawn':
				pseudoLegalMoves[square] = pseudoLegalPawnMoves(boardState, square);
				break;
			case 'knight':
				pseudoLegalMoves[square] = pseudoLegalKnightMoves(boardState, square);
				break;
			case 'bishop':
				pseudoLegalMoves[square] = pseudoLegalBishopMoves(boardState, square);
				break;
		}
	});
	return pseudoLegalMoves;
};