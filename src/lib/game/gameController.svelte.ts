import type { BoardState } from '../types.ts';
import { fenToBoardState, boardStateToFen } from './fen';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FEN_STRING_STORAGE_KEY = 'fenString'

interface GameState {
	selectedTileId: string | undefined;
	boardState: BoardState;
}

const createNewGameState = (): GameState => {
	const storedBoardState = localStorage.getItem(FEN_STRING_STORAGE_KEY)
	return {
		selectedTileId: undefined,
		boardState: fenToBoardState(storedBoardState || START_FEN)
	}
};

export const gameState = $state<GameState>(createNewGameState());

export const resetGame = () => {
	localStorage.removeItem(FEN_STRING_STORAGE_KEY)
	const resetState = createNewGameState();
	gameState.selectedTileId = resetState.selectedTileId;
	gameState.boardState = resetState.boardState;
};

export const selectTile = (tileId: string) => {
	if (gameState.selectedTileId === tileId) {
		deselectTile();
		return;
	}

	if (gameState.boardState.piecePlacement[tileId]?.side === gameState.boardState.activeSide) {
		gameState.selectedTileId = tileId;
		return
	}

	if (gameState.selectedTileId !== undefined) {
		// TODO: this is a naive implementation implement legal move checking
		// TODO: set half move counter, castling availability and en passant target

		const targetTile = gameState.boardState.piecePlacement[tileId];
		if (targetTile?.side === gameState.boardState.activeSide) {
			return;
		}
		const selectedPiece = gameState.boardState.piecePlacement[gameState.selectedTileId];
		gameState.boardState.piecePlacement[gameState.selectedTileId] = undefined;
		// TODO: increment score counter by removed piece if capturing
		gameState.boardState.piecePlacement[tileId] = selectedPiece;
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
};

const deselectTile = () => {
	gameState.selectedTileId = undefined;
};

const persistBoardState = () => {
	const fenString = boardStateToFen(gameState.boardState)
	localStorage.setItem(FEN_STRING_STORAGE_KEY, fenString)
}
