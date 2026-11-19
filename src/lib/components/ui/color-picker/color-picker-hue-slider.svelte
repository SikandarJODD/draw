<script lang="ts">
	import { cn } from '#lib/utils.js';
	import * as Slider from '#lib/components/ui/slider/index.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';

	type Props = { class?: string; disabled?: boolean; id?: string };
	let { class: className, disabled = false, id }: Props = $props();
	const { state, options } = getColorPickerContext('ColorPicker.HueSlider');
</script>

<div class="color-picker-hue-slider">
	<Slider.Root
		type="single"
		data-slot="color-picker-hue-slider"
		value={state.hsv.h}
		onValueChange={(hue: number) => state.setHsv({ ...state.hsv, h: hue })}
		max={360}
		step={1}
		disabled={disabled || options.disabled || options.readOnly}
		{id}
		class={cn('w-full', className)}
	/>
</div>

<style>
	.color-picker-hue-slider :global([data-slot='slider-track']) {
		height: 0.75rem;
		background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
	}
	.color-picker-hue-slider :global([data-slot='slider-range']) {
		display: none;
	}
	.color-picker-hue-slider :global([data-slot='slider-thumb']) {
		border-radius: 9999px;
		border-width: 2px;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
	}
</style>
