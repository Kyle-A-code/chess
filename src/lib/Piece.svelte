<script lang="ts">
	import type { Piece } from './types';

	let { piece }: { piece: Piece } = $props();

	// Todo: replace with svg icons
	const pieceIcon = {
		pawn: '♟',
		knight: '♞',
		bishop: '♝',
		rook: '♜',
		queen: '♛',
		king: '♚',
	};
</script>

<div class="piece {piece.side} {piece.type}">
	{pieceIcon[piece.type]}
</div>

<style>
	.piece {
		/* Todo: remove font-size once svg icons are used */
		font-size: 3rem;
	}
	.light {
		color: #ffffff;
		-webkit-text-stroke: 1px #111827;
		text-shadow:
			1px 0 0 #111827,
			-1px 0 0 #111827,
			0 1px 0 #111827,
			0 -1px 0 #111827;
	}

	.dark {
		color: #111827;
		-webkit-text-stroke: 1px #f9fafb;
		text-shadow:
			1px 0 0 #f9fafb,
			-1px 0 0 #f9fafb,
			0 1px 0 #f9fafb,
			0 -1px 0 #f9fafb;
	}
</style>
