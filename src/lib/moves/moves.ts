import { pseudoLegalKnightMoves } from '../moves/knight';
import { pseudoLegalBishopMoves } from '../moves/bishop';
import { handlePawnSideEffects, pseudoLegalPawnMoves } from '../moves/pawn';
import { isSquare, type Square } from '../game/boardPrimitives';
import type { BoardState, KingMove, Move, Moves, Side } from '../types';
import { pseudoLegalQueenMoves } from './queen';
import { handleRookSideEffects, pseudoLegalRookMoves } from './rook';
import {
	handleKingSideEffects,
	pseudoLegalKingMoves,
	WHITE_KINGSIDE_CASTLING_PATH,
	WHITE_QUEENSIDE_CASTLING_PATH,
	BLACK_KINGSIDE_CASTLING_PATH,
	BLACK_QUEENSIDE_CASTLING_PATH
} from './king';

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

	for (const [from, candidates] of Object.entries(getPseudoLegalMoves(boardState))) {
		const fromSquare = from as Square;
		legalMoves[fromSquare] = candidates.filter((move) => {
			if (boardState.piecePlacement[fromSquare]?.type === 'king' && isCastleMove(move)) {
				return isLegalCastlingMove(boardState, move, fromSquare);
			}

			return moveDoesNotExposeKingToCheck(boardState, move, fromSquare);
		});
	}

	return legalMoves;
};

export const getFriendlyKingSquare = (boardState: BoardState, side: Side): Square | undefined => {
	return (Object.keys(boardState.piecePlacement) as Array<Square>).find((square) => {
		const piece = boardState.piecePlacement[square];
		return piece?.type === 'king' && piece.side === side;
	});
};

export const isActiveSideInCheck = (boardState: BoardState, kingSquare: Square): boolean => {
	const piece = boardState.piecePlacement[kingSquare];
	if (!piece || piece.type !== 'king' || piece.side !== boardState.activeSide) {
		throw new Error("kingSquare must be the active side's king");
	}
	const clonedBoardState = cloneBoardState(boardState);
	clonedBoardState.activeSide = clonedBoardState.activeSide === 'w' ? 'b' : 'w';
	return Object.values(getPseudoLegalMoves(clonedBoardState)).some((moves) =>
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

const getPseudoLegalMoves = (boardState: BoardState): Moves => {
	const moves: Moves = {};
	for (const [square, piece] of Object.entries(boardState.piecePlacement)) {
		if (!piece || !isSquare(square) || piece.side !== boardState.activeSide) continue;
		moves[square] = moveGenerators[piece.type](boardState, square);
	}
	return moves;
};

const isLegalCastlingMove = (
	boardState: BoardState,
	move: KingMove,
	fromSquare: Square
): boolean => {
	if (isActiveSideInCheck(boardState, fromSquare)) return false;

	return getCastlingPath(boardState, move).every((square) => {
		const tempMove = { to: square };
		const clonedBoardState = cloneBoardState(boardState);
		processMove(clonedBoardState, tempMove, fromSquare);
		return !isActiveSideInCheck(clonedBoardState, square);
	});
};

const getCastlingPath = (boardState: BoardState, move: KingMove): Square[] => {
	if (move.isCastlingQueenside) {
		return boardState.activeSide === 'w'
			? WHITE_QUEENSIDE_CASTLING_PATH
			: BLACK_QUEENSIDE_CASTLING_PATH;
	}
	if (move.isCastlingKingside) {
		return boardState.activeSide === 'w'
			? WHITE_KINGSIDE_CASTLING_PATH
			: BLACK_KINGSIDE_CASTLING_PATH;
	}
	return [];
};

const moveDoesNotExposeKingToCheck = (
	boardState: BoardState,
	move: Move,
	fromSquare: Square
): boolean => {
	const clonedBoardState = cloneBoardState(boardState);
	processMove(clonedBoardState, move, fromSquare);

	const kingSquare = getFriendlyKingSquare(clonedBoardState, boardState.activeSide);
	if (!kingSquare) throw new Error('King square not found');

	return !isActiveSideInCheck(clonedBoardState, kingSquare);
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
