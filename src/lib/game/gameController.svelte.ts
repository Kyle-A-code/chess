import type { Side, BoardState } from '../types.ts';

// TODO: replace below with FEN parsing once implemented
export const INITIAL_BOARD_STATE: BoardState = {
	a1: { type: 'rook', side: 'light' },
	b1: { type: 'knight', side: 'light' },
	c1: { type: 'bishop', side: 'light' },
	d1: { type: 'queen', side: 'light' },
	e1: { type: 'king', side: 'light' },
	f1: { type: 'bishop', side: 'light' },
	g1: { type: 'knight', side: 'light' },
	h1: { type: 'rook', side: 'light' },
	a2: { type: 'pawn', side: 'light' },
	b2: { type: 'pawn', side: 'light' },
	c2: { type: 'pawn', side: 'light' },
	d2: { type: 'pawn', side: 'light' },
	e2: { type: 'pawn', side: 'light' },
	f2: { type: 'pawn', side: 'light' },
	g2: { type: 'pawn', side: 'light' },
	h2: { type: 'pawn', side: 'light' },
	a7: { type: 'pawn', side: 'dark' },
	b7: { type: 'pawn', side: 'dark' },
	c7: { type: 'pawn', side: 'dark' },
	d7: { type: 'pawn', side: 'dark' },
	e7: { type: 'pawn', side: 'dark' },
	f7: { type: 'pawn', side: 'dark' },
	g7: { type: 'pawn', side: 'dark' },
	h7: { type: 'pawn', side: 'dark' },
	a8: { type: 'rook', side: 'dark' },
	b8: { type: 'knight', side: 'dark' },
	c8: { type: 'bishop', side: 'dark' },
	d8: { type: 'queen', side: 'dark' },
	e8: { type: 'king', side: 'dark' },
	f8: { type: 'bishop', side: 'dark' },
	g8: { type: 'knight', side: 'dark' },
	h8: { type: 'rook', side: 'dark' }
};

interface GameState {
	currentTurn: number;
	activeSide: Side;
	selectedTileId: string | undefined;
	boardState: BoardState;
}


const INITIAL_CURRENT_TURN = 1;
const INITIAL_ACTIVE_SIDE = 'light';
const INITIAL_SELECTED_TILE_ID = undefined;

export const gameState = $state<GameState>({
	currentTurn: INITIAL_CURRENT_TURN,
	activeSide: INITIAL_ACTIVE_SIDE,
	selectedTileId: INITIAL_SELECTED_TILE_ID,
	boardState: INITIAL_BOARD_STATE
});

export const resetGame = () => {
	gameState.currentTurn = INITIAL_CURRENT_TURN;
	gameState.activeSide = INITIAL_ACTIVE_SIDE;
	gameState.selectedTileId = INITIAL_SELECTED_TILE_ID;
	gameState.boardState = INITIAL_BOARD_STATE;
};

export const selectTile = (tileId: string) => {
	if (gameState.selectedTileId === tileId) {
		deselectTile();
		return;
	}

	if (gameState.selectedTileId !== undefined) {
		// TODO: this is a naive implementation implement legal move checking
		const targetTile = gameState.boardState[tileId];
		if (targetTile?.side === gameState.activeSide) {
			return;
		}
		const selectedPiece = gameState.boardState[gameState.selectedTileId];
		gameState.boardState[gameState.selectedTileId] = undefined;
		gameState.boardState[tileId] = selectedPiece;
		deselectTile();
		nextTurn();
	}

	if (gameState.boardState[tileId]?.side !== gameState.activeSide) {
		return;
	}

	gameState.selectedTileId = tileId;
};

const nextTurn = () => {
	gameState.currentTurn++;
	swapSide();
};

const swapSide = () => {
	if (gameState.activeSide === 'light') {
		gameState.activeSide = 'dark';
	} else {
		gameState.activeSide = 'light';
	}
};

const deselectTile = () => {
	gameState.selectedTileId = undefined;
};
