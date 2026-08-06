import { processPawnMove } from '../moves/pawn';
import type { BoardState, Move, PseudoLegalMoves } from '../types';
import type { Square } from './boardPrimitives';
import { fenToBoardState, boardStateToFen, START_FEN } from './fen';
import { getPseudoLegalMoves } from '../moves/moves';
import { handleRookSideEffects } from '../moves/rook';

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
		// TODO: this is a naive implementation implement legal move checking
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

		processMove(attemptedMove, gameState.selectedTileId);
		deselectTile();
		nextTurn();
		persistBoardState();
	}
};

// TODO: this function needs refactoring into concise helpers, holding off until all move types and check logic is implemented
// To ensure correct abstraction for handling move processing and side effects
const processMove = (move: Move, selectedTileId: Square) => {
	gameState.boardState.enPassantTarget = undefined;

	const selectedPiece = gameState.boardState.piecePlacement[selectedTileId];
	gameState.boardState.piecePlacement[selectedTileId] = undefined;
	// TODO: increment score counter by removed piece if capturing
	const capturedPiece = gameState.boardState.piecePlacement[move.to];
	gameState.boardState.piecePlacement[move.to] = selectedPiece;

	if (selectedPiece?.type === 'pawn') {
		processPawnMove(gameState.boardState, move);
	}
	if (selectedPiece?.type === 'rook') {
		handleRookSideEffects(gameState.boardState, selectedTileId);
	}

	if (capturedPiece?.type === 'rook') {
		handleRookSideEffects(gameState.boardState, move.to);
	}
	console.log(gameState.boardState.castlingAvailability);
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
