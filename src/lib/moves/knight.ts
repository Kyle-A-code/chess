import type { BoardState, Side, Move } from '../types';
import {
	RANKS,
	FILES,
	squareToFileRank,
	isSquare,
	type Rank,
	type File,
	type Square
} from '../game/boardPrimitives';

const KNIGHT_OFFSETS = [
	[-2, 1],
	[-2, -1],
	[2, 1],
	[2, -1],
	[-1, 2],
	[-1, -2],
	[1, 2],
	[1, -2]
];

const getPseudoLegalMoves = (
	boardState: BoardState,
	side: Side,
	file: File,
	rank: Rank
): Move[] => {
	const moves: Move[] = [];
	const currentRankIndex = RANKS.indexOf(rank);
	const currentFileIndex = FILES.indexOf(file);

	KNIGHT_OFFSETS.forEach(([fileOffset, rankOffset]) => {
		const targetRankIndex = currentRankIndex + rankOffset;
		const targetFileIndex = currentFileIndex + fileOffset;
		const targetSquare = `${FILES[targetFileIndex]}${RANKS[targetRankIndex]}`;
		if (isSquare(targetSquare) && boardState.piecePlacement[targetSquare]?.side !== side) {
			moves.push({ to: targetSquare });
		}
	});

	return moves;
};

export const pseudoLegalKnightMoves = (boardState: BoardState, square: Square) => {
	const [file, rank] = squareToFileRank(square);
	const piece = boardState.piecePlacement[square];
	if (piece?.type !== 'knight') throw new Error('Tile is not a knight');
	const side = piece.side;
	return getPseudoLegalMoves(boardState, side, file, rank);
};
