import type { BoardState, Move, Side } from '../../types';
import type { Rank, File } from '../../game/boardPrimitives';
import { FILES, isSquare, RANKS } from '../../game/boardPrimitives';

const DIRECTIONS = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1]
];

export const getOrthogonalMoves = (
	boardState: BoardState,
	side: Side,
	currentFile: File,
	currentRank: Rank
): Move[] => {
	const moves: Move[] = [];
	const currentRankIndex = RANKS.indexOf(currentRank);
	const currentFileIndex = FILES.indexOf(currentFile);

	for (const direction of DIRECTIONS) {
		let targetFileIndex = currentFileIndex + direction[0];
		let targetRankIndex = currentRankIndex + direction[1];
		let targetSquare = `${FILES[targetFileIndex]}${RANKS[targetRankIndex]}`;
		while (isSquare(targetSquare)) {
			const piece = boardState.piecePlacement[targetSquare];
			if (piece !== undefined) {
				if (piece.side !== side) {
					moves.push({ to: targetSquare });
				}
				break;
			}

			moves.push({ to: targetSquare });
			targetFileIndex += direction[0];
			targetRankIndex += direction[1];
			targetSquare = `${FILES[targetFileIndex]}${RANKS[targetRankIndex]}`;
		}
	}
	return moves;
};
