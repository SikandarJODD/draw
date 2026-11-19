<script lang="ts">
	import { watch } from 'runed';
	import InputGroupItem from './input-group-item.svelte';
	import { hexToRgb, rgbToHex } from '../color-picker-utils.js';
	import type { FormatInputProps } from '../color-picker.types.js';

	let {
		color,
		disabled,
		withoutAlpha,
		onColorChange,
		class: className,
		placeholder
	}: FormatInputProps = $props();

	let draft = $state('');
	watch(
		() => color,
		(nextColor) => {
			draft = rgbToHex(nextColor, !withoutAlpha && nextColor.a < 1);
		}
	);

	function commit() {
		const nextColor = hexToRgb(draft, color.a);
		if (nextColor) onColorChange(nextColor);
		else draft = rgbToHex(color, !withoutAlpha && color.a < 1);
	}
</script>

<InputGroupItem
	position="only"
	aria-label="Hex color"
	value={draft}
	oninput={(event) => (draft = event.currentTarget.value)}
	onblur={commit}
	onkeydown={(event) => {
		if (event.key === 'Enter') commit();
	}}
	{disabled}
	class={className ?? 'w-full text-left'}
	{placeholder}
	spellcheck={false}
/>
