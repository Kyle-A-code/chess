import type { BoardState, PseudoLegalMoves } from '../types';
import type { Square } from './boardPrimitives';
import { fenToBoardState, boardStateToFen, START_FEN } from './fen';
import { getPseudoLegalMoves, processMove } from '../moves/moves';

const FEN_STRING_STORAGE_KEY = 'fenString';

interface GameState {
	selectedTileId: Square | undefined;
	boardState: BoardState;
	pseudoLegalMoves: PseudoLegalMoves;
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
	const pseudoLegalMoves = getPseudoLegalMoves(boardState);
	return {
		selectedTileId: undefined,
		boardState,
		pseudoLegalMoves
	};
};

export const gameState = $state<GameState>(createNewGameState());

export const resetGame = () => {
	removeStoredFen();
	const resetState = createNewGameState();
	gameState.selectedTileId = resetState.selectedTileId;
	gameState.boardState = resetState.boardState;
	gameState.pseudoLegalMoves = getPseudoLegalMoves(gameState.boardState);
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
		const moves = gameState.pseudoLegalMoves[gameState.selectedTileId];

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
	gameState.pseudoLegalMoves = getPseudoLegalMoves(gameState.boardState);
};

const deselectTile = () => {
	gameState.selectedTileId = undefined;
};

const persistBoardState = () => {
	const fenString = boardStateToFen(gameState.boardState);
	persistFen(fenString);
};
