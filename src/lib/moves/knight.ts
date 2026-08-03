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

const getPseudoLegalMoves = (
	boardState: BoardState,
	side: Side,
	file: File,
	rank: Rank
): Move[] => {
	const moves: Move[] = [];
	const rankIdx = RANKS.indexOf(rank);
	const fileIdx = FILES.indexOf(file);

	const possibleMoves = [
		{ file: fileIdx - 2, rank: rankIdx + 1 },
		{ file: fileIdx - 2, rank: rankIdx - 1 },
		{ file: fileIdx + 2, rank: rankIdx + 1 },
		{ file: fileIdx + 2, rank: rankIdx - 1 },
		{ file: fileIdx - 1, rank: rankIdx + 2 },
		{ file: fileIdx - 1, rank: rankIdx - 2 },
		{ file: fileIdx + 1, rank: rankIdx + 2 },
		{ file: fileIdx + 1, rank: rankIdx - 2 }
	];

	possibleMoves.forEach((move) => {
		const targetSquare = `${FILES[move.file]}${RANKS[move.rank]}`;
		if (isSquare(targetSquare) && boardState.piecePlacement[targetSquare]?.side !== side) {
			moves.push({ to: targetSquare });
		}
	});

	return moves;
};

export const pseudoLegalKnightMoves = (boardState: BoardState, square: Square) => {
	const [file, rank] = square.split('');
	if (!isFile(file) || !isRank(rank)) throw new Error('Invalid tile');
	const piece = boardState.piecePlacement[square];
	if (piece?.type !== 'knight') throw new Error('Tile is not a knight');
	const side = piece.side;
	return getPseudoLegalMoves(boardState, side, file, rank);
};
