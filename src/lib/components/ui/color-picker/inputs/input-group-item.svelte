<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';
	import { Input } from '#lib/components/ui/input/index.js';

	type Props = {
		position: 'first' | 'middle' | 'last' | 'only';
		class?: string;
		value?: string | number;
		disabled?: boolean;
		placeholder?: string;
		inputmode?: HTMLInputAttributes['inputmode'];
		min?: number | string;
		max?: number | string;
		spellcheck?: boolean;
		'aria-label': string;
		oninput?: HTMLInputAttributes['oninput'];
		onblur?: HTMLInputAttributes['onblur'];
		onkeydown?: HTMLInputAttributes['onkeydown'];
	};

	let {
		position,
		class: className,
		value,
		disabled,
		placeholder,
		inputmode,
		min,
		max,
		spellcheck,
		'aria-label': ariaLabel,
		oninput,
		onblur,
		onkeydown
	}: Props = $props();
</script>

<Input
	type="text"
	data-slot="color-picker-input-item"
	aria-label={ariaLabel}
	{value}
	{disabled}
	{placeholder}
	{inputmode}
	{min}
	{max}
	{spellcheck}
	{oninput}
	{onblur}
	{onkeydown}
	class={cn(
		'relative w-14 text-center tabular-nums focus-visible:z-10',
		position === 'first' && 'rounded-r-none',
		position === 'middle' && '-ml-px rounded-none',
		position === 'last' && '-ml-px rounded-l-none',
		className
	)}
/>
