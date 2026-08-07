import type { BoardState, Piece, PiecePlacement, Side } from '../../lib/types';
import type { Square } from '../../lib/game/boardPrimitives';

type CreateBoardStateOptions = {
	enPassantTarget?: Square;
	activeSide?: Side;
};

export const createBoardState = (
	piecePlacement: PiecePlacement,
	options: CreateBoardStateOptions = {}
): BoardState => {
	const { enPassantTarget, activeSide = 'w' } = options;
	return {
		piecePlacement,
		activeSide,
		enPassantTarget,
		halfMoveClock: 0,
		fullMoveNumber: 1
	};
};
