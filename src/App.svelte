<script lang="ts">
	import Board from './lib/Board.svelte';
	import { resetGame } from './lib/game/gameController.svelte';
</script>

<main>
	<Board />
	<button type="button" onclick={resetGame}>Reset game</button>
</main>

<style>
	main {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		--controls-width: 7rem;
		width: max-content;
		max-width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	button {
		width: var(--controls-width);
		white-space: nowrap;
		margin-top: 2rem;
	}
</style>
