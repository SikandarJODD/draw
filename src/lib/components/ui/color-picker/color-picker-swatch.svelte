<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Attachment } from 'svelte/attachments';
	import { cn } from '#lib/utils.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';
	import { colorToString } from './color-picker-utils.js';

	type Props = HTMLAttributes<HTMLDivElement> & { ref?: HTMLDivElement | null };
	let { ref = $bindable(null), class: className, ...restProps }: Props = $props();
	const { state, options } = getColorPickerContext('ColorPicker.Swatch');
	let color = $derived(
		`rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, ${state.color.a})`
	);
	let background = $derived(
		state.color.a < 1
			? `linear-gradient(${color}, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 50% / 8px 8px`
			: color
	);
	const attachRef: Attachment<HTMLDivElement> = (node) => {
		ref = node;
		return () => {
			if (ref === node) ref = null;
		};
	};
</script>

<div
	{@attach attachRef}
	data-slot="color-picker-swatch"
	role="img"
	aria-label={`Current color: ${colorToString(state.color, state.format)}`}
	class={cn('size-8 rounded-sm border shadow-sm', options.disabled && 'opacity-50', className)}
	style:background
	style:forced-color-adjust="none"
	{...restProps}
></div>
