<script lang="ts">
	import { getColorPickerContext } from './color-picker-context.svelte.js';
	import HexInput from './inputs/hex-input.svelte';
	import RgbInput from './inputs/rgb-input.svelte';
	import HslInput from './inputs/hsl-input.svelte';
	import HsbInput from './inputs/hsb-input.svelte';

	type Props = {
		withoutAlpha?: boolean;
		disabled?: boolean;
		class?: string;
		placeholder?: string;
	};

	let { withoutAlpha = false, disabled = false, class: className, placeholder }: Props = $props();
	const { state, options } = getColorPickerContext('ColorPicker.Input');
	let isDisabled = $derived(disabled || options.disabled || options.readOnly);
</script>

{#if state.format === 'hex'}
	<HexInput
		color={state.color}
		hsv={state.hsv}
		disabled={isDisabled}
		{withoutAlpha}
		onColorChange={state.setColor}
		class={className}
		{placeholder}
	/>
{:else if state.format === 'rgb'}
	<RgbInput
		color={state.color}
		hsv={state.hsv}
		disabled={isDisabled}
		{withoutAlpha}
		onColorChange={state.setColor}
		class={className}
		{placeholder}
	/>
{:else if state.format === 'hsl'}
	<HslInput
		color={state.color}
		hsv={state.hsv}
		disabled={isDisabled}
		{withoutAlpha}
		onColorChange={state.setColor}
		class={className}
		{placeholder}
	/>
{:else}
	<HsbInput
		color={state.color}
		hsv={state.hsv}
		disabled={isDisabled}
		{withoutAlpha}
		onColorChange={state.setColor}
		class={className}
		{placeholder}
	/>
{/if}
