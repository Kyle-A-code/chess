<script lang="ts">
	import type { Tile } from './types';
	import Piece from './Piece.svelte';
	import { gameState, selectTile } from './game/gameController.svelte';

	let { tile }: { tile: Tile } = $props();

	const getTileElement = (e: DragEvent): HTMLElement | null => {
		const target = e.currentTarget;
		return target instanceof HTMLElement && target.classList.contains('tile') ? target : null;
	};

	const setHover = (e: DragEvent, isHover: boolean) => {
		const target = getTileElement(e);
		if (target) {
			target.classList.toggle('drag_hover', isHover);
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		selectTile(tile.id);
		setHover(e, false);
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		setHover(e, true);
	};

	const clearHover = (e: DragEvent) => {
		setHover(e, false);
	};
</script>

<button
	class="tile {tile.colour}"
	class:selected={tile.id === gameState.selectedTileId}
	id={tile.id}
	onclick={() => selectTile(tile.id)}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={clearHover}
>
	{#if tile.piece}
		<Piece piece={tile.piece} tileId={tile.id} />
	{/if}
</button>

<style>
	.tile {
		display: grid;
		place-items: center;
		border: none;
	}
	.selected,
	.drag_hover {
		box-shadow: inset 0 0 0 9999px rgba(255, 215, 0, 0.35);
	}

	.w {
		background-color: white;
	}

	.b {
		background-color: black;
	}
</style>
