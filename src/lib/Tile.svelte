<script lang="ts">
	import type { Tile } from './types';
	import Piece from './Piece.svelte';

	let { tile }: { tile: Tile } = $props();
</script>

<div class="tile {tile.side}" id={tile.id}>
	{#if tile.piece}
		<Piece piece={tile.piece} />
	{/if}
</div>

<style>
	.tile {
		display: grid;
		place-items: center;
	}

	.light {
		background-color: white;
	}

	.dark {
		background-color: black;
	}
</style>
