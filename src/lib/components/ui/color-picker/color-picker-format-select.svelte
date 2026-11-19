<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';
	import { getColorPickerContext } from './color-picker-context.svelte.js';
	import { colorFormats, type ColorFormat } from './color-picker.types.js';

	type Props = {
		class?: string;
		size?: 'sm' | 'default';
		disabled?: boolean;
	};

	let { class: className, size = 'sm', disabled = false }: Props = $props();
	const { state, options } = getColorPickerContext('ColorPicker.FormatSelect');
</script>

<Select.Root
	type="single"
	value={state.format}
	onValueChange={(value: string) => state.setFormat(value as ColorFormat)}
	disabled={disabled || options.disabled || options.readOnly}
>
	<Select.Trigger data-slot="color-picker-format-select-trigger" {size} class={className}>
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each colorFormats as format (format)}
			<Select.Item value={format} label={format.toUpperCase()} />
		{/each}
	</Select.Content>
</Select.Root>
