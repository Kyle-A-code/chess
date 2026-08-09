import type { BoardState, Moves, Side } from '../types';
import type { Square } from './boardPrimitives';
import { fenToBoardState, boardStateToFen, START_FEN } from './fen';
import { findKingSquareForSide, getLegalMoves, isActiveSideInCheck, processMove } from '../moves/moves';

const FEN_STRING_STORAGE_KEY = 'fenString';

interface GameState {
	selectedTileId: Square | undefined;
	boardState: BoardState;
	moves: Moves;
	checkmatedSide?: Side | undefined;
	stalematedSide?: Side | undefined;
}

const getStoredFen = (): string | null => {
	if (typeof localStorage === 'undefined') {
		return null;
	}
	return localStorage.getItem(FEN_STRING_STORAGE_KEY);
};

const removeStoredFen = () => {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.removeItem(FEN_STRING_STORAGE_KEY);
};

const persistFen = (fen: string) => {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.setItem(FEN_STRING_STORAGE_KEY, fen);
};

const createNewGameState = (): GameState => {
	const storedBoardState = getStoredFen();
	const boardState = fenToBoardState(storedBoardState || START_FEN);
	const moves = getLegalMoves(boardState);
	return {
		selectedTileId: undefined,
		boardState,
		moves
	};
};

export const gameState = $state<GameState>(createNewGameState());

export const resetGame = () => {
	removeStoredFen();
	const resetState = createNewGameState();
	gameState.selectedTileId = resetState.selectedTileId;
	gameState.boardState = resetState.boardState;
	gameState.moves = getLegalMoves(gameState.boardState);
	gameState.checkmatedSide = undefined;
	gameState.stalematedSide = undefined;
};

export const selectTile = (tileId: Square) => {
	if (gameState.selectedTileId === tileId) {
		deselectTile();
		return;
	}

	if (gameState.boardState.piecePlacement[tileId]?.side === gameState.boardState.activeSide) {
		gameState.selectedTileId = tileId;
		return;
	}

	if (gameState.selectedTileId !== undefined) {
		// TODO: set half move counter, castling availability

		const targetTile = gameState.boardState.piecePlacement[tileId];
		if (targetTile?.side === gameState.boardState.activeSide) {
			return;
		}
		const moves = gameState.moves[gameState.selectedTileId];

		// TODO: once all move types are implemented, we can just return if moves are undefined
		const attemptedMove = moves?.find((move) => move.to === tileId);
		if (attemptedMove === undefined) {
			// TODO: ideally do something visual like make the tile flash red
			return;
		}

		processMove(gameState.boardState, attemptedMove, gameState.selectedTileId);
		deselectTile();
		nextTurn();
		persistBoardState();
	}
};

const nextTurn = () => {
	if (gameState.boardState.activeSide === 'w') {
		gameState.boardState.activeSide = 'b';
	} else {
		gameState.boardState.activeSide = 'w';
		gameState.boardState.fullMoveNumber++;
	}
	gameState.moves = getLegalMoves(gameState.boardState);
	if (!canMove()) {
		const kingSquare = findKingSquareForSide(gameState.boardState, gameState.boardState.activeSide);
		if (!kingSquare) {
			throw new Error("king square not found");
		}
		if (isActiveSideInCheck(gameState.boardState, kingSquare)) {
			gameState.checkmatedSide = gameState.boardState.activeSide;
		} else {
			gameState.stalematedSide = gameState.boardState.activeSide;
		}
	}
};

const deselectTile = () => {
	gameState.selectedTileId = undefined;
};

const persistBoardState = () => {
	const fenString = boardStateToFen(gameState.boardState);
	persistFen(fenString);
};

const canMove = (): boolean => {
	for (const moves of Object.values(gameState.moves)) {
		if (moves.length > 0) return true;
	}
	return false;
};