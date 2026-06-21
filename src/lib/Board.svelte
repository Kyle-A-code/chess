<script lang="ts">
	import Tile from './Tile.svelte';
	import { gameState } from './game/gameController.svelte';
	import { BOARD_TILES, FILES, RANKS_REVERSE } from './game/boardPrimitives';
</script>

<div class="board-container">
	<div class="file file-top">
		{#each FILES as file}<div>{file}</div>{/each}
	</div>
	<div class="rank rank-left">
		{#each RANKS_REVERSE as rank}<div>{rank}</div>{/each}
	</div>
	<div class="board">
		{#each BOARD_TILES as tile}
			<Tile
				tile={{
					id: tile.id,
					colour: tile.colour,
					piece: gameState.boardState.piecePlacement[tile.id]
				}}
			/>
		{/each}
	</div>
	<div class="rank rank-right">
		{#each RANKS_REVERSE as rank}<div>{rank}</div>{/each}
	</div>
	<div class="file file-bottom">
		{#each FILES as file}<div>{file}</div>{/each}
	</div>
</div>

<style>
	.board-container {
		display: grid;
		--label: 2rem;
		--size: min(calc(100vw - 2 * var(--label)), calc(100vh - 2 * var(--label)));
		grid-template-columns: var(--label) var(--size) var(--label);
		grid-template-rows: var(--label) var(--size) var(--label);
		width: calc(var(--size) + 2 * var(--label));
		height: calc(var(--size) + 2 * var(--label));
		grid-template-areas:
			'. file-top .'
			'rank-left board rank-right'
			'. file-bottom .';
	}
	.board {
		grid-area: board;
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(8, 1fr);
		width: 100%;
		aspect-ratio: 1 / 1;
	}
	.file {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		place-items: center;
	}
	.file-top {
		grid-area: file-top;
	}
	.file-bottom {
		grid-area: file-bottom;
	}
	.rank {
		display: grid;
		grid-template-rows: repeat(8, 1fr);
		place-items: center;
	}
	.rank-left {
		grid-area: rank-left;
	}
	.rank-right {
		grid-area: rank-right;
	}
</style>
