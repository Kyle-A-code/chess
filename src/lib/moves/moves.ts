import { pseudoLegalKnightMoves } from '../moves/knight';
import { pseudoLegalBishopMoves } from '../moves/bishop';
import { handlePawnSideEffects, pseudoLegalPawnMoves } from '../moves/pawn';
import { isSquare, type Square } from '../game/boardPrimitives';
import type { BoardState, Move, PseudoLegalMoves } from '../types';
import { pseudoLegalQueenMoves } from './queen';
import { handleRookSideEffects, pseudoLegalRookMoves } from './rook';
import { handleKingSideEffects, pseudoLegalKingMoves } from './king';

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
			case 'rook':
				pseudoLegalMoves[square] = pseudoLegalRookMoves(boardState, square);
				break;
			case 'queen':
				pseudoLegalMoves[square] = pseudoLegalQueenMoves(boardState, square);
				break;
			case 'king':
				pseudoLegalMoves[square] = pseudoLegalKingMoves(boardState, square);
				break;
		}
	});

	return pseudoLegalMoves;
};

export const processMove = (boardState: BoardState, move: Move, currentSquare: Square) => {
	boardState.enPassantTarget = undefined;

	const selectedPiece = boardState.piecePlacement[currentSquare];
	boardState.piecePlacement[currentSquare] = undefined;
	// TODO: increment score counter by removed piece if capturing
	const capturedPiece = boardState.piecePlacement[move.to];
	boardState.piecePlacement[move.to] = selectedPiece;

	if (selectedPiece?.type === 'pawn') {
		handlePawnSideEffects(boardState, move);
	}
	if (selectedPiece?.type === 'rook') {
		handleRookSideEffects(boardState, currentSquare);
	}

	if (capturedPiece?.type === 'rook') {
		handleRookSideEffects(boardState, move.to);
	}

	if (selectedPiece?.type === 'king') {
		handleKingSideEffects(boardState, move);
	}
};
