import type { BoardState } from '../types.ts';
import { parseFenString } from './fen.svelte';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface GameState {
	selectedTileId: string | undefined;
	boardState: BoardState;
}

const createNewGameState = (): GameState => ({
	selectedTileId: INITIAL_SELECTED_TILE_ID,
	boardState: parseFenString(START_FEN)
});

const INITIAL_SELECTED_TILE_ID = undefined;

export const gameState = $state<GameState>(createNewGameState());

export const resetGame = () => {
	const resetState = createNewGameState();
	gameState.selectedTileId = resetState.selectedTileId;
	gameState.boardState = resetState.boardState;
};

export const selectTile = (tileId: string) => {
	if (gameState.selectedTileId === tileId) {
		deselectTile();
		return;
	}

	if (gameState.selectedTileId !== undefined) {
		// TODO: this is a naive implementation implement legal move checking
		const targetTile = gameState.boardState.piecePlacement[tileId];
		if (targetTile?.side === gameState.boardState.activeSide) {
			return;
		}
		const selectedPiece = gameState.boardState.piecePlacement[gameState.selectedTileId];
		gameState.boardState.piecePlacement[gameState.selectedTileId] = undefined;
		gameState.boardState.piecePlacement[tileId] = selectedPiece;
		deselectTile();
		nextTurn();
	}

	if (gameState.boardState.piecePlacement[tileId]?.side !== gameState.boardState.activeSide) {
		return;
	}

	gameState.selectedTileId = tileId;
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
