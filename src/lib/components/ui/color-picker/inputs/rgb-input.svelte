<script lang="ts">
	import { cn } from '#lib/utils.js';
	import InputGroupItem from './input-group-item.svelte';
	import type { ColorValue, FormatInputProps } from '../color-picker.types.js';

	let {
		color,
		disabled,
		withoutAlpha,
		onColorChange,
		class: className,
		placeholder
	}: FormatInputProps = $props();
	const channels = ['r', 'g', 'b'] as const;

	function updateChannel(channel: keyof Pick<ColorValue, 'r' | 'g' | 'b'>, event: Event) {
		const value = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);
		if (Number.isInteger(value) && value >= 0 && value <= 255)
			onColorChange({ ...color, [channel]: value });
	}

	function updateAlpha(event: Event) {
		const value = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);
		if (Number.isInteger(value) && value >= 0 && value <= 100)
			onColorChange({ ...color, a: value / 100 });
	}
</script>

<div
	data-slot="color-picker-input-wrapper"
	class={cn(
		'flex min-w-0 flex-1 flex-nowrap [&_[data-slot=color-picker-input-item]]:min-w-0 [&_[data-slot=color-picker-input-item]]:flex-1',
		className
	)}
>
	{#each channels as channel, index (channel)}
		<InputGroupItem
			position={index === 0 ? 'first' : withoutAlpha && index === 2 ? 'last' : 'middle'}
			aria-label={`${channel.toUpperCase()} channel (0–255)`}
			value={color[channel]}
			oninput={(event) => updateChannel(channel, event)}
			inputmode="numeric"
			min="0"
			max="255"
			{placeholder}
			{disabled}
		/>
	{/each}
	{#if !withoutAlpha}
		<InputGroupItem
			position="last"
			aria-label="Alpha percentage"
			value={Math.round(color.a * 100)}
			oninput={updateAlpha}
			inputmode="numeric"
			min="0"
			max="100"
			{placeholder}
			{disabled}
		/>
	{/if}
</div>
