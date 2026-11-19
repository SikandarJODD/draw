<script lang="ts">
	import { watch } from 'runed';
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { ColorPickerState, setColorPickerContext } from './color-picker-context.svelte.js';
	import { colorToString } from './color-picker-utils.js';
	import type { ColorFormat, Direction } from './color-picker.types.js';

	type Props = HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		children?: Snippet;
		value?: string;
		defaultValue?: string;
		onValueChange?: (value: string) => void;
		format?: ColorFormat;
		defaultFormat?: ColorFormat;
		onFormatChange?: (format: ColorFormat) => void;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		modal?: boolean;
		name?: string;
		dir?: Direction;
		disabled?: boolean;
		inline?: boolean;
		readOnly?: boolean;
		required?: boolean;
	};

	let {
		ref = $bindable(null),
		children,
		value = $bindable(),
		defaultValue = '#000000',
		onValueChange,
		format = $bindable(),
		defaultFormat = 'hex',
		onFormatChange,
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		modal = false,
		name,
		dir = 'ltr',
		disabled = false,
		inline = false,
		readOnly = false,
		required = false,
		class: className,
		...restProps
	}: Props = $props();

	const getInitialValue = () => value ?? defaultValue;
	const getInitialFormat = () => format ?? defaultFormat;
	const getInitialOpen = () => open ?? defaultOpen;
	const state = new ColorPickerState(getInitialValue(), getInitialFormat(), getInitialOpen());
	const attachRef: Attachment<HTMLDivElement> = (node) => {
		ref = node;
		return () => {
			if (ref === node) ref = null;
		};
	};

	state.onValueChange = (nextValue) => {
		value = nextValue;
		onValueChange?.(nextValue);
	};
	state.onFormatChange = (nextFormat) => {
		format = nextFormat;
		onFormatChange?.(nextFormat);
	};
	state.onOpenChange = (nextOpen) => {
		open = nextOpen;
		onOpenChange?.(nextOpen);
	};

	watch(
		() => value,
		(nextValue) => state.syncValue(nextValue ?? defaultValue),
		{ lazy: true }
	);
	watch(
		() => format,
		(nextFormat) => {
			if (nextFormat && nextFormat !== state.format) state.format = nextFormat;
		},
		{ lazy: true }
	);
	watch(
		() => open,
		(nextOpen) => {
			if (nextOpen !== undefined && nextOpen !== state.open) state.open = nextOpen;
		},
		{ lazy: true }
	);

	setColorPickerContext({
		state,
		options: {
			get dir() {
				return dir;
			},
			get disabled() {
				return disabled;
			},
			get inline() {
				return inline;
			},
			get readOnly() {
				return readOnly;
			},
			get required() {
				return required;
			}
		}
	});
</script>

{#snippet root()}
	<div
		{@attach attachRef}
		data-slot="color-picker"
		class={cn('contents', className)}
		{dir}
		{...restProps}
	>
		{@render children?.()}
		{#if name}
			<input
				type="hidden"
				{name}
				value={value ?? colorToString(state.color, state.format)}
				{disabled}
				readonly={readOnly}
				{required}
			/>
		{/if}
	</div>
{/snippet}

{#if inline}
	{@render root()}
{:else}
	<Popover.Root bind:open={state.open} onOpenChange={state.setOpen}>
		{@render root()}
	</Popover.Root>
{/if}
