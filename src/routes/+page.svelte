<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import * as ColorPicker from '#lib/components/ui/color-picker/index.ts';
	import DrawingArtboard from '#lib/components/draw/drawing-artboard.svelte';
	import { ARTBOARD } from '#lib/draw/config.ts';
	import { mode } from 'mode-watcher';
	import { Draw, type DrawHandle } from 'sv-drawesome';

	let drawing: DrawHandle;
	let color = $state('#1f8ca8');

	async function downloadSvg() {
		await drawing.download('sketch', 'svg');
	}

	async function downloadPng() {
		await drawing.download('sketch', 'png', 2);
	}
</script>

<div class="fixed top-4 left-4 z-20">
	<ColorPicker.Root bind:value={color} name="drawing-color">
		<div
			class="flex items-center gap-2 rounded-lg border bg-background/90 p-1.5 shadow-sm backdrop-blur"
		>
			<ColorPicker.Trigger aria-label="Choose drawing color">
				<ColorPicker.Swatch class="size-5 border-0 shadow-none" />
			</ColorPicker.Trigger>
			<code class="min-w-24 px-1 text-xs text-muted-foreground">{color}</code>
		</div>

		<ColorPicker.Content>
			<ColorPicker.Area />
			<div class="flex items-center gap-3">
				<ColorPicker.EyeDropper />
				<div class="flex flex-1 flex-col gap-3">
					<ColorPicker.HueSlider />
					<ColorPicker.AlphaSlider />
				</div>
			</div>
			<div class="flex items-center gap-2">
				<ColorPicker.FormatSelect />
				<ColorPicker.Input class="flex-1" />
			</div>
		</ColorPicker.Content>
	</ColorPicker.Root>
</div>

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
