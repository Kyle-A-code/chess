import { pseudoLegalKnightMoves } from '../moves/knight';
import { pseudoLegalBishopMoves } from '../moves/bishop';
import { handlePawnSideEffects, pseudoLegalPawnMoves } from '../moves/pawn';
import { isSquare, type Square } from '../game/boardPrimitives';
import type { BoardState, KingMove, Move, Moves, Side } from '../types';
import { pseudoLegalQueenMoves } from './queen';
import { handleRookSideEffects, pseudoLegalRookMoves } from './rook';
import { handleKingSideEffects, pseudoLegalKingMoves } from './king';

const moveGenerators = {
	pawn: pseudoLegalPawnMoves,
	knight: pseudoLegalKnightMoves,
	bishop: pseudoLegalBishopMoves,
	rook: pseudoLegalRookMoves,
	queen: pseudoLegalQueenMoves,
	king: pseudoLegalKingMoves
} as const;

export const getLegalMoves = (boardState: BoardState): Moves => {
	const legalMoves: Moves = {};
	const friendlySide = boardState.activeSide;

	for (const [from, candidates] of Object.entries(getPseudoLegalMoves(boardState))) {
		const fromSquare = from as Square;
		legalMoves[fromSquare] = candidates.filter((move) => {
			if (boardState.piecePlacement[fromSquare]?.type === 'king' && isCastleMove(move)) {
				if (isInCheck(boardState, fromSquare)) return false;

				return isLegalCastlingMove(boardState, move);
			}

			const next = cloneBoardState(boardState);
			processMove(next, move, fromSquare);

			const kingSquare = getFriendlyKingSquare(next, friendlySide);
			if (!kingSquare) throw new Error('King square not found');

			next.activeSide = next.activeSide === 'w' ? 'b' : 'w';
			return !isInCheck(next, kingSquare);
		});
	}

	return legalMoves;
};

const isLegalCastlingMove = (boardState: BoardState, move: KingMove): boolean => {
	// TODO: check for castling path not putting the king in check
	return true;
};

const getPseudoLegalMoves = (boardState: BoardState): Moves => {
	const moves: Moves = {};
	for (const [square, piece] of Object.entries(boardState.piecePlacement)) {
		if (!piece || !isSquare(square) || piece.side !== boardState.activeSide) continue;
		moves[square] = moveGenerators[piece.type](boardState, square);
	}
	return moves;
};

const getFriendlyKingSquare = (boardState: BoardState, side: Side): Square | undefined => {
	return (Object.keys(boardState.piecePlacement) as Array<Square>).find((square) => {
		const piece = boardState.piecePlacement[square];
		return piece?.type === 'king' && piece.side === side;
	});
};

export const isInCheck = (boardState: BoardState, kingSquare: Square): boolean => {
	return Object.values(getPseudoLegalMoves(boardState)).some((moves) =>
		moves.some((move) => move.to === kingSquare)
	);
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

const cloneBoardState = (boardState: BoardState): BoardState => ({
	piecePlacement: { ...boardState.piecePlacement },
	activeSide: boardState.activeSide,
	castlingAvailability: boardState.castlingAvailability,
	enPassantTarget: boardState.enPassantTarget,
	halfMoveClock: boardState.halfMoveClock,
	fullMoveNumber: boardState.fullMoveNumber
});

const isCastleMove = (move: Move): move is KingMove =>
	'isCastlingQueenside' in move || 'isCastlingKingside' in move;
