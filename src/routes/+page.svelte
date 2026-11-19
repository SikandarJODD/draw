<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import DrawingArtboard from '#lib/components/draw/drawing-artboard.svelte';
	import { ARTBOARD } from '#lib/draw/config.ts';
	import { mode } from 'mode-watcher';
	import { Draw, type DrawHandle } from 'sv-drawesome';

	let drawing: DrawHandle;

	async function downloadSvg() {
		await drawing.download('sketch', 'svg');
	}

	async function downloadPng() {
		await drawing.download('sketch', 'png', 2);
	}
</script>

<div class="fixed top-4 right-4 z-10 flex gap-2">
	<Button onclick={downloadSvg}>Download SVG</Button>
	<Button onclick={downloadPng}>Download PNG</Button>
</div>

<DrawingArtboard>
	<Draw
		bind:this={drawing}
		board={ARTBOARD}
		class="drawing-canvas"
		inset="-6.25rem"
		theme={mode.current}
		look="studio"
		settings="bar"
		gauge
		depth="soft"
	/>
</DrawingArtboard>
