<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Attachment } from 'svelte/attachments';
	import { cn } from '#lib/utils.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';
	import { hsvToRgb } from './color-picker-utils.js';

	type Props = HTMLAttributes<HTMLDivElement> & { ref?: HTMLDivElement | null };

	let {
		ref = $bindable(null),
		class: className,
		onpointerdown,
		onpointermove,
		onpointerup,
		onkeydown,
		...restProps
	}: Props = $props();

	const { state: picker, options } = getColorPickerContext('ColorPicker.Area');
	let dragging = $state(false);
	let backgroundColor = $derived(hsvToRgb({ h: picker.hsv.h, s: 100, v: 100, a: 1 }));
	const attachRef: Attachment<HTMLDivElement> = (node) => {
		ref = node;
		return () => {
			if (ref === node) ref = null;
		};
	};

	function updateFromPosition(clientX: number, clientY: number) {
		if (!ref || options.disabled || options.readOnly) return;
		const rect = ref.getBoundingClientRect();
		const saturation = Math.round(
			Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * 100
		);
		const brightness = Math.round(
			(1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))) * 100
		);
		picker.setHsv({ ...picker.hsv, s: saturation, v: brightness });
	}

	function handlePointerDown(event: PointerEvent) {
		(onpointerdown as ((event: PointerEvent) => void) | undefined)?.(event);
		if (event.defaultPrevented || options.disabled || options.readOnly) return;
		dragging = true;
		ref?.setPointerCapture(event.pointerId);
		updateFromPosition(event.clientX, event.clientY);
	}

	function handlePointerMove(event: PointerEvent) {
		(onpointermove as ((event: PointerEvent) => void) | undefined)?.(event);
		if (!event.defaultPrevented && dragging) updateFromPosition(event.clientX, event.clientY);
	}

	function handlePointerUp(event: PointerEvent) {
		(onpointerup as ((event: PointerEvent) => void) | undefined)?.(event);
		dragging = false;
		if (ref?.hasPointerCapture(event.pointerId)) ref.releasePointerCapture(event.pointerId);
	}

	function handleKeydown(event: KeyboardEvent) {
		(onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
		if (event.defaultPrevented || options.disabled || options.readOnly) return;
		const step = event.shiftKey ? 10 : 1;
		const next = { ...picker.hsv };
		if (event.key === 'ArrowLeft') next.s = Math.max(0, next.s - step);
		else if (event.key === 'ArrowRight') next.s = Math.min(100, next.s + step);
		else if (event.key === 'ArrowUp') next.v = Math.min(100, next.v + step);
		else if (event.key === 'ArrowDown') next.v = Math.max(0, next.v - step);
		else return;
		event.preventDefault();
		picker.setHsv(next);
	}
</script>

<div
	{@attach attachRef}
	data-slot="color-picker-area"
	role="slider"
	tabindex={options.disabled ? undefined : 0}
	aria-label="Saturation and brightness"
	aria-disabled={options.disabled}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={picker.hsv.s}
	aria-valuetext={`Saturation ${picker.hsv.s}%, brightness ${picker.hsv.v}%`}
	class={cn(
		'relative h-40 w-full touch-none overflow-hidden rounded-md border focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none',
		options.disabled || options.readOnly ? 'pointer-events-none opacity-50' : 'cursor-crosshair',
		className
	)}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onkeydown={handleKeydown}
	{...restProps}
>
	<div
		class="absolute inset-0"
		style:background-color={`rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`}
	></div>
	<div class="absolute inset-0 bg-linear-to-r from-white to-transparent"></div>
	<div class="absolute inset-0 bg-linear-to-b from-transparent to-black"></div>
	<div
		class="pointer-events-none absolute size-3 -translate-1/2 rounded-full border-2 border-white shadow-sm"
		style:left={`${picker.hsv.s}%`}
		style:top={`${100 - picker.hsv.v}%`}
	></div>
</div>
