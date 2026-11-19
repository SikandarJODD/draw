<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte';
	import PipetteIcon from '@lucide/svelte/icons/pipette';
	import { Button } from '#lib/components/ui/button/index.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';
	import { hexToRgb } from './color-picker-utils.js';
	import type { EyeDropperConstructor } from './color-picker.types.js';

	type Props = ComponentProps<typeof Button>;
	let { children, disabled = false, size, ...restProps }: Props = $props();
	const { state: picker, options } = getColorPickerContext('ColorPicker.EyeDropper');
	let EyeDropper = $state<EyeDropperConstructor>();

	onMount(() => {
		EyeDropper = (window as typeof window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
	});

	async function pickColor() {
		if (!EyeDropper) return;
		try {
			const result = await new EyeDropper().open();
			const color = hexToRgb(result.sRGBHex, picker.color.a);
			if (color) picker.setColor(color);
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			console.warn('EyeDropper failed', error);
		}
	}
</script>

{#if EyeDropper}
	<Button
		data-slot="color-picker-eye-dropper"
		variant="outline"
		size={size ?? (children ? 'default' : 'icon')}
		disabled={disabled || options.disabled || options.readOnly}
		onclick={pickColor}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			<PipetteIcon />
			<span class="sr-only">Pick a color from the screen</span>
		{/if}
	</Button>
{/if}
