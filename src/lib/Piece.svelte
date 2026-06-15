<script lang="ts">
	import type { Piece } from './types';

	let { piece }: { piece: Piece } = $props();
</script>

<div class="piece {piece.side} {piece.type}">
  {piece.type}
</div>

<style>
	.light {
		color: saddlebrown;
	}

	.dark {
		color: brown;
	}
</style>
