<script lang="ts">
	import type { Tile } from './types';
	import Piece from './Piece.svelte';
	import { gameState, selectTile } from './game/gameController.svelte';

	let { tile }: { tile: Tile } = $props();
</script>

<button
	class="tile {tile.side}"
	class:selected={tile.id === gameState.selectedTileId}
	id={tile.id}
	onclick={() => selectTile(tile.id)}
>
	{#if tile.piece}
		<Piece piece={tile.piece} />
	{/if}
</button>

<style>
	.tile {
		display: grid;
		place-items: center;
		border: none;
	}
	.selected {
		box-shadow: inset 0 0 0 9999px rgba(255, 215, 0, 0.35);
	}

	.light {
		background-color: white;
	}

	.dark {
		background-color: black;
	}
</style>
