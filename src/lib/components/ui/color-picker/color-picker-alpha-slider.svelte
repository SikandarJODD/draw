<script lang="ts">
	import { cn } from '#lib/utils.js';
	import * as Slider from '#lib/components/ui/slider/index.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';

	type Props = { class?: string; disabled?: boolean; id?: string };
	let { class: className, disabled = false, id }: Props = $props();
	const { state, options } = getColorPickerContext('ColorPicker.AlphaSlider');
	let gradient = $derived(
		`linear-gradient(to right, transparent, rgb(${state.color.r} ${state.color.g} ${state.color.b}))`
	);
</script>

<div class="color-picker-alpha-slider" style:--alpha-gradient={gradient}>
	<Slider.Root
		type="single"
		data-slot="color-picker-alpha-slider"
		value={Math.round(state.color.a * 100)}
		onValueChange={(alpha: number) => state.setColor({ ...state.color, a: alpha / 100 })}
		max={100}
		step={1}
		disabled={disabled || options.disabled || options.readOnly}
		{id}
		class={cn('w-full', className)}
	/>
</div>

<style>
	.color-picker-alpha-slider :global([data-slot='slider-track']) {
		height: 0.75rem;
		background-color: white;
		background-image:
			var(--alpha-gradient), linear-gradient(45deg, #ccc 25%, transparent 25%),
			linear-gradient(-45deg, #ccc 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #ccc 75%),
			linear-gradient(-45deg, transparent 75%, #ccc 75%);
		background-position:
			0 0,
			0 0,
			0 4px,
			4px -4px,
			-4px 0;
		background-size:
			100% 100%,
			8px 8px,
			8px 8px,
			8px 8px,
			8px 8px;
	}
	.color-picker-alpha-slider :global([data-slot='slider-range']) {
		display: none;
	}
	.color-picker-alpha-slider :global([data-slot='slider-thumb']) {
		border-radius: 9999px;
		border-width: 2px;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
	}
</style>
