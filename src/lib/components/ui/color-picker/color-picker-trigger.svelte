<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { cn } from '#lib/utils.js';
	import { buttonVariants } from '#lib/components/ui/button/button.svelte';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';

	type Props = ComponentProps<typeof Popover.Trigger> & {
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		children,
		disabled = false,
		class: className,
		...restProps
	}: Props = $props();

	const context = getColorPickerContext('ColorPicker.Trigger');
</script>

<Popover.Trigger
	bind:ref
	data-slot="color-picker-trigger"
	class={cn(buttonVariants({ variant: 'outline', size: 'icon' }), className)}
	disabled={disabled || context.options.disabled}
	{...restProps}
>
	{@render children?.()}
</Popover.Trigger>
