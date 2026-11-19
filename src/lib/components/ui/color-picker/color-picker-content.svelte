<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { cn } from '#lib/utils.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';

	type Props = {
		ref?: HTMLDivElement | null;
		children?: Snippet;
		sideOffset?: number;
		align?: 'start' | 'center' | 'end';
		class?: string;
		id?: string;
		style?: string;
	};

	let {
		ref = $bindable(null),
		children,
		sideOffset = 6,
		align = 'start',
		class: className,
		id,
		style
	}: Props = $props();

	const context = getColorPickerContext('ColorPicker.Content');
	const attachRef: Attachment<HTMLDivElement> = (node) => {
		ref = node;
		return () => {
			if (ref === node) ref = null;
		};
	};
</script>

{#if context.options.inline}
	<div
		{@attach attachRef}
		data-slot="color-picker-content"
		class={cn('flex w-80 flex-col gap-4 rounded-lg border bg-popover p-4 shadow-sm', className)}
		{id}
		{style}
	>
		{@render children?.()}
	</div>
{:else}
	<Popover.Content
		{@attach attachRef}
		data-slot="color-picker-content"
		{sideOffset}
		{align}
		class={cn('flex w-80 flex-col gap-4 p-4', className)}
		{id}
		{style}
	>
		{@render children?.()}
	</Popover.Content>
{/if}
