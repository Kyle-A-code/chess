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

export const WHITE_QUEENSIDE_CASTLING_PATH: Square[] = ['c1', 'd1'];
export const WHITE_KINGSIDE_CASTLING_PATH: Square[] = ['f1', 'g1'];
export const BLACK_QUEENSIDE_CASTLING_PATH: Square[] = ['c8', 'd8'];
export const BLACK_KINGSIDE_CASTLING_PATH: Square[] = ['f8', 'g8'];

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
			['b1', ...WHITE_QUEENSIDE_CASTLING_PATH].every(
				(square) => boardState.piecePlacement[square as Square] === undefined
			)
		) {
			moves.push({ to: 'c1', isCastlingQueenside: true });
		}
		if (
			boardState.castlingAvailability.includes('K') &&
			boardState.piecePlacement['h1']?.type === 'rook' &&
			WHITE_KINGSIDE_CASTLING_PATH.every(
				(square) => boardState.piecePlacement[square] === undefined
			)
		) {
			moves.push({ to: 'g1', isCastlingKingside: true });
		}
	} else {
		if (
			boardState.castlingAvailability.includes('q') &&
			boardState.piecePlacement['a8']?.type === 'rook' &&
			['b8', ...BLACK_QUEENSIDE_CASTLING_PATH].every(
				(square) => boardState.piecePlacement[square as Square] === undefined
			)
		) {
			moves.push({ to: 'c8', isCastlingQueenside: true });
		}
		if (
			boardState.castlingAvailability.includes('k') &&
			boardState.piecePlacement['h8']?.type === 'rook' &&
			BLACK_KINGSIDE_CASTLING_PATH.every(
				(square) => boardState.piecePlacement[square] === undefined
			)
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
