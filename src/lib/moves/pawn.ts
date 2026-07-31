import type { BoardState, Side, Move } from '../types';
import {
	RANKS,
	FILES,
	isRank,
	isFile,
	isSquare,
	type Rank,
	type File,
	type Square
} from '../game/boardPrimitives';

const isFirstMove = (side: Side, rank: Rank) => {
	return side === 'w' ? rank === '2' : rank === '7';
};

const canPromote = (rank: Rank) => {
	return rank === '1' || rank === '8';
};

const getCaptureMove = (
	boardState: BoardState,
	side: Side,
	targetSquare: Square,
	targetRank: Rank
): Move | undefined => {
	const targetPiece = boardState.piecePlacement[targetSquare];
	if (targetPiece === undefined || targetPiece.side === side) return undefined;

	return { to: targetSquare, isPromotion: canPromote(targetRank) };
};

const getEnPassantMove = (
	boardState: BoardState,
	side: Side,
	targetFile: File,
	currentRank: Rank,
	targetSquare: Square
): Move | undefined => {
	const adjacentSquare = `${targetFile}${currentRank}`;
	if (
		boardState.enPassantTarget === undefined ||
		targetSquare !== boardState.enPassantTarget ||
		boardState.piecePlacement[targetSquare] !== undefined ||
		!isSquare(adjacentSquare)
	)
		return undefined;

	const adjacentPiece = boardState.piecePlacement[adjacentSquare];
	if (adjacentPiece?.type !== 'pawn' || adjacentPiece.side === side) return undefined;

	return { to: targetSquare, enPassantCapture: adjacentSquare };
};

const getDiagonalMove = (
	boardState: BoardState,
	side: Side,
	targetFile: File,
	currentRank: Rank,
	targetRank: Rank
): Move | undefined => {
	const targetSquare = `${targetFile}${targetRank}`;
	if (!isSquare(targetSquare)) return undefined;

	const captureMove = getCaptureMove(boardState, side, targetSquare, targetRank);
	if (captureMove !== undefined) return captureMove;

	const enPassantMove = getEnPassantMove(boardState, side, targetFile, currentRank, targetSquare);
	if (enPassantMove !== undefined) return enPassantMove;

	return undefined;
};

const getPseudoLegalMoves = (
	boardState: BoardState,
	side: Side,
	file: File,
	rank: Rank
): Move[] => {
	const moves: Move[] = [];
	const direction = side === 'w' ? 1 : -1;
	const rankIdx = RANKS.indexOf(rank);
	const fileIdx = FILES.indexOf(file);
	const targetRank = RANKS[rankIdx + 1 * direction];
	const leftFile = FILES[fileIdx - 1];
	const rightFile = FILES[fileIdx + 1];
	const forwardSquare = `${file}${targetRank}`;

	if (isSquare(forwardSquare) && boardState.piecePlacement[forwardSquare] === undefined) {
		moves.push({ to: forwardSquare, isPromotion: canPromote(targetRank) });

		if (isFirstMove(side, rank)) {
			const targetSquare = `${file}${RANKS[rankIdx + 2 * direction]}`;
			if (isSquare(targetSquare) && boardState.piecePlacement[targetSquare] === undefined) {
				moves.push({ to: targetSquare, enPassantTarget: forwardSquare });
			}
		}
	}

	if (isFile(leftFile)) {
		const diagonalMove = getDiagonalMove(boardState, side, leftFile, rank, targetRank);
		if (diagonalMove !== undefined) moves.push(diagonalMove);
	}

	if (isFile(rightFile)) {
		const diagonalMove = getDiagonalMove(boardState, side, rightFile, rank, targetRank);
		if (diagonalMove !== undefined) moves.push(diagonalMove);
	}

	return moves;
};

export const pseudoLegalPawnMoves = (boardState: BoardState, square: Square) => {
	const [file, rank] = square.split('');
	if (!isFile(file) || !isRank(rank)) throw new Error('Invalid tile');
	const piece = boardState.piecePlacement[square];
	if (piece?.type !== 'pawn') throw new Error('Tile is not a pawn');
	const side = piece.side;
	return getPseudoLegalMoves(boardState, side, file, rank);
};

export const processPawnMove = (boardState: BoardState, move: Move) => {
	if (move.enPassantTarget !== undefined) {
		boardState.enPassantTarget = move.enPassantTarget;
	}

	if (move.isPromotion) {
		boardState.piecePlacement[move.to] = {
			type: 'queen',
			side: boardState.activeSide
		};
	}

	if (move.enPassantCapture !== undefined) {
		boardState.piecePlacement[move.enPassantCapture] = undefined;
	}
};
