import { processPawnMove, pseudoLegalPawnMoves } from '../moves/pawn.js';
import type { BoardState, Move } from '../types.ts';
import type { Square } from './boardPrimitives';
import { fenToBoardState, boardStateToFen, START_FEN } from './fen';

const FEN_STRING_STORAGE_KEY = 'fenString';

interface GameState {
	selectedTileId: Square | undefined;
	boardState: BoardState;
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
	return {
		selectedTileId: undefined,
		boardState: fenToBoardState(storedBoardState || START_FEN)
	};
};

export const gameState = $state<GameState>(createNewGameState());

export const resetGame = () => {
	removeStoredFen();
	const resetState = createNewGameState();
	gameState.selectedTileId = resetState.selectedTileId;
	gameState.boardState = resetState.boardState;
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
		// TODO: this is a naive implementation implement legal move checking
		// TODO: set half move counter, castling availability

		const targetTile = gameState.boardState.piecePlacement[tileId];
		if (targetTile?.side === gameState.boardState.activeSide) {
			return;
		}
		const moves = getPseudoLegalMoves(gameState.selectedTileId);

		// TODO: once all move types are implemented, we can just return if moves are undefined
		const attemptedMove = moves?.find((move) => move.to === tileId);
		if (attemptedMove === undefined) {
			// TODO: ideally do something visual like make the tile flash red
			return;
		}

		processMove(attemptedMove, gameState.selectedTileId);
		deselectTile();
		nextTurn();
		persistBoardState();
	}
};

const processMove = (move: Move, selectedTileId: Square) => {
	gameState.boardState.enPassantTarget = undefined;

	const selectedPiece = gameState.boardState.piecePlacement[selectedTileId];
	gameState.boardState.piecePlacement[selectedTileId] = undefined;
	// TODO: increment score counter by removed piece if capturing
	gameState.boardState.piecePlacement[move.to] = selectedPiece;

	if (selectedPiece?.type === 'pawn') {
		processPawnMove(gameState.boardState, move);
	}
};

const nextTurn = () => {
	if (gameState.boardState.activeSide === 'w') {
		gameState.boardState.activeSide = 'b';
	} else {
		gameState.boardState.activeSide = 'w';
		gameState.boardState.fullMoveNumber++;
	}
};

const deselectTile = () => {
	gameState.selectedTileId = undefined;
};

const persistBoardState = () => {
	const fenString = boardStateToFen(gameState.boardState);
	persistFen(fenString);
};

const getPseudoLegalMoves = (tileId: Square): Move[] | undefined => {
	const piece = gameState.boardState.piecePlacement[tileId];
	if (piece === undefined) {
		return undefined;
	}
	switch (piece.type) {
		case 'pawn':
			return pseudoLegalPawnMoves(gameState.boardState, tileId);
		default:
			return undefined;
	}
};
