<script lang="ts">
	import type { Piece } from './types';
	import { selectTile } from './game/gameController.svelte';
	import { gameState } from './game/gameController.svelte';

	let { piece, tileId }: { piece: Piece; tileId: string } = $props();

	// Todo: replace with svg icons
	const pieceIcon = {
		pawn: '♟',
		knight: '♞',
		bishop: '♝',
		rook: '♜',
		queen: '♛',
		king: '♚'
	};

	const handleDragStart = () => {
		selectTile(tileId);
	};

	// If drag is ended via this resets the tile
	const handleDragEnd = () => {
		if (gameState.selectedTileId === tileId) {
			selectTile(tileId);
		}
	};
</script>

<div
	class="piece {piece.side} {piece.type}"
	role="presentation"
	draggable={piece.side === gameState.boardState.activeSide}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
>
	{pieceIcon[piece.type]}
</div>

<style>
	.piece {
		/* Todo: remove font-size once svg icons are used */
		font-size: 3rem;
	}
	.w {
		color: #ffffff;
		-webkit-text-stroke: 1px #111827;
		text-shadow:
			1px 0 0 #111827,
			-1px 0 0 #111827,
			0 1px 0 #111827,
			0 -1px 0 #111827;
	}

	.b {
		color: #111827;
		-webkit-text-stroke: 1px #f9fafb;
		text-shadow:
			1px 0 0 #f9fafb,
			-1px 0 0 #f9fafb,
			0 1px 0 #f9fafb,
			0 -1px 0 #f9fafb;
	}
</style>
