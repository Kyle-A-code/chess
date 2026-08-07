import type { BoardState, Side, KingMove } from '../types';
import {
	RANKS,
	FILES,
	isSquare,
	type Rank,
	type File,
	type Square,
	squareToFileRank
} from '../game/boardPrimitives';

const DIRECTIONS = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
	[1, 1],
	[1, -1],
	[-1, 1],
	[-1, -1]
];

const getCastleMoves = (boardState: BoardState, side: Side, currentSquare: Square): KingMove[] => {
	const moves: KingMove[] = [];
	if (boardState.castlingAvailability === undefined || boardState.castlingAvailability === '')
		return moves;
	if (side === 'w' && currentSquare !== 'e1') return moves;
	if (side === 'b' && currentSquare !== 'e8') return moves;

	if (side === 'w') {
		if (
			boardState.castlingAvailability.includes('Q') &&
			boardState.piecePlacement['a1']?.type === 'rook' &&
			boardState.piecePlacement['b1'] === undefined &&
			boardState.piecePlacement['c1'] === undefined &&
			boardState.piecePlacement['d1'] === undefined
		) {
			moves.push({ to: 'c1', isCastlingQueenside: true });
		}
		if (
			boardState.castlingAvailability.includes('K') &&
			boardState.piecePlacement['h1']?.type === 'rook' &&
			boardState.piecePlacement['f1'] === undefined &&
			boardState.piecePlacement['g1'] === undefined
		) {
			moves.push({ to: 'g1', isCastlingKingside: true });
		}
	} else {
		if (
			boardState.castlingAvailability.includes('q') &&
			boardState.piecePlacement['a8']?.type === 'rook' &&
			boardState.piecePlacement['b8'] === undefined &&
			boardState.piecePlacement['c8'] === undefined &&
			boardState.piecePlacement['d8'] === undefined
		) {
			moves.push({ to: 'c8', isCastlingQueenside: true });
		}
		if (
			boardState.castlingAvailability.includes('k') &&
			boardState.piecePlacement['h8']?.type === 'rook' &&
			boardState.piecePlacement['f8'] === undefined &&
			boardState.piecePlacement['g8'] === undefined
		) {
			moves.push({ to: 'g8', isCastlingKingside: true });
		}
	}

	return moves;
};

const getPseudoLegalMoves = (
	boardState: BoardState,
	side: Side,
	currentFile: File,
	currentRank: Rank
): KingMove[] => {
	const moves: KingMove[] = [];
	const currentRankIndex = RANKS.indexOf(currentRank);
	const currentFileIndex = FILES.indexOf(currentFile);

	for (const direction of DIRECTIONS) {
		let targetFileIndex = currentFileIndex + direction[0];
		let targetRankIndex = currentRankIndex + direction[1];
		let targetSquare = `${FILES[targetFileIndex]}${RANKS[targetRankIndex]}`;
		if (isSquare(targetSquare)) {
			const piece = boardState.piecePlacement[targetSquare];
			if (piece?.side !== side) {
				moves.push({ to: targetSquare });
			}
		}
	}

	moves.push(...getCastleMoves(boardState, side, `${currentFile}${currentRank}`));
	return moves;
};

export const pseudoLegalKingMoves = (boardState: BoardState, square: Square) => {
	const [file, rank] = squareToFileRank(square);
	const piece = boardState.piecePlacement[square];
	if (piece?.type !== 'king') throw new Error('Tile is not a king');
	const side = piece.side;
	return getPseudoLegalMoves(boardState, side, file, rank);
};

export const handleKingSideEffects = (boardState: BoardState, move: KingMove) => {
	const side = boardState.activeSide;
	if (boardState.castlingAvailability === undefined || boardState.castlingAvailability === '')
		return;

	if (move.isCastlingQueenside) {
		if (side === 'w') {
			boardState.piecePlacement['d1'] = boardState.piecePlacement['a1'];
			boardState.piecePlacement['a1'] = undefined;
		} else {
			boardState.piecePlacement['d8'] = boardState.piecePlacement['a8'];
			boardState.piecePlacement['a8'] = undefined;
		}
	} else if (move.isCastlingKingside) {
		if (side === 'w') {
			boardState.piecePlacement['f1'] = boardState.piecePlacement['h1'];
			boardState.piecePlacement['h1'] = undefined;
		} else {
			boardState.piecePlacement['f8'] = boardState.piecePlacement['h8'];
			boardState.piecePlacement['h8'] = undefined;
		}
	}

	if (side === 'w') {
		boardState.castlingAvailability = boardState.castlingAvailability.replace('K', '');
		boardState.castlingAvailability = boardState.castlingAvailability.replace('Q', '');
	} else {
		boardState.castlingAvailability = boardState.castlingAvailability.replace('k', '');
		boardState.castlingAvailability = boardState.castlingAvailability.replace('q', '');
	}
	return boardState;
};
