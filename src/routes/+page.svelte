<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
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

<div class="canvas h-screen w-full">
	<div class="absolute top-4 right-4 z-10 flex gap-2">
		<Button onclick={downloadSvg}>Download SVG</Button>
		<Button onclick={downloadPng}>Download PNG</Button>
	</div>
	<Draw
		bind:this={drawing}
		draggable
		theme={mode.current}
		look="studio"
		settings="bar"
		gauge
		depth="strong"
	/>
</div>
