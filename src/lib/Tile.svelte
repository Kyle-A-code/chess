<script lang="ts">
	import type { Tile } from './types';

	let { tile }: { tile: Tile } = $props();
</script>

<div class="tile {tile.side}" id={tile.id}></div>

<style>
	.light {
		background-color: white;
	}

	.dark {
		background-color: black;
	}
</style>
