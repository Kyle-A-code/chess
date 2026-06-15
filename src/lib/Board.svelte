<script lang="ts">
	import Tile from './Tile.svelte';
	import type { Side } from './types';

	const INITIAL_BOARD_STATE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
	const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
	const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
	const TILE_IDS = RANKS.flatMap((rank, _i) => FILES.map((file, _j) => `${file}${rank}`));

	const calcSide = (index: number): Side => {
		const row = Math.floor(index / 8);
		const col = index % 8;
		return (row + col) % 2 === 0 ? 'light' : 'dark';
	};
</script>

<div class="board-container">
	<div class="file file-top">
		{#each FILES as file}<div>{file}</div>{/each}
	</div>
	<div class="rank rank-left">
		{#each RANKS as rank}<div>{rank}</div>{/each}
	</div>
	<div class="board">
		{#each TILE_IDS as tileId, i}
			<Tile tile={{ id: tileId, side: calcSide(i) }} />
		{/each}
	</div>
	<div class="rank rank-right">
		{#each RANKS as rank}<div>{rank}</div>{/each}
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
