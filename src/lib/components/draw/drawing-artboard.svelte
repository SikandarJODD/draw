<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<main class="workspace">
	<div class="artboard">
		{@render children()}
	</div>
</main>

<style>
	.workspace {
		display: grid;
		min-height: 100svh;
		place-items: center;
		overflow: hidden;
		padding: 4rem 1.5rem 8rem;
		background: color-mix(in oklch, var(--muted) 78%, var(--background));
	}

	.artboard {
		position: relative;
		width: min(88vw, 115.2vh, 75rem);
		aspect-ratio: 8 / 5;
		border: 1px solid color-mix(in oklch, var(--foreground) 12%, transparent);
		border-radius: 1rem;
		background: #ffffff;
		box-shadow:
			0 1px 2px oklch(0 0 0 / 5%),
			0 8px 24px oklch(0 0 0 / 8%);
	}

	.artboard :global(.drawing-canvas) {
		overflow: visible;
	}

	@media (max-width: 40rem) {
		.workspace {
			padding-inline: 0.75rem;
		}

		.artboard {
			width: min(94vw, 115.2vh);
		}
	}
</style>
