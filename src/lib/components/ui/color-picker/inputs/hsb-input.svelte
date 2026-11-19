<script lang="ts">
	import { cn } from '#lib/utils.js';
	import InputGroupItem from './input-group-item.svelte';
	import { hsvToRgb } from '../color-picker-utils.js';
	import type { FormatInputProps } from '../color-picker.types.js';

	let {
		color,
		hsv,
		disabled,
		withoutAlpha,
		onColorChange,
		class: className,
		placeholder
	}: FormatInputProps = $props();
	const channels = [
		{ key: 'h', max: 360 },
		{ key: 's', max: 100 },
		{ key: 'v', max: 100 }
	] as const;

	function update(channel: 'h' | 's' | 'v', max: number, event: Event) {
		const value = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);
		if (!Number.isInteger(value) || value < 0 || value > max) return;
		onColorChange(hsvToRgb({ ...hsv, [channel]: value }));
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
	{#each channels as channel, index (channel.key)}
		<InputGroupItem
			position={index === 0 ? 'first' : withoutAlpha && index === 2 ? 'last' : 'middle'}
			aria-label={`${channel.key.toUpperCase()} channel (0–${channel.max})`}
			value={hsv[channel.key]}
			oninput={(event) => update(channel.key, channel.max, event)}
			inputmode="numeric"
			min="0"
			max={channel.max}
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
