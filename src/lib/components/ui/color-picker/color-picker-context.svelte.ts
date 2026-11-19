import { getContext, setContext } from 'svelte';
import { colorToString, parseColorString, rgbToHsv, hsvToRgb } from './color-picker-utils.js';
import type {
	ColorFormat,
	ColorPickerOptions,
	ColorValue,
	HSVColorValue
} from './color-picker.types.js';

const COLOR_PICKER_CONTEXT = Symbol('color-picker');

export class ColorPickerState {
	color = $state<ColorValue>({ r: 0, g: 0, b: 0, a: 1 });
	hsv = $state<HSVColorValue>({ h: 0, s: 0, v: 0, a: 1 });
	format = $state<ColorFormat>('hex');
	open = $state(false);

	onValueChange?: (value: string) => void;
	onFormatChange?: (format: ColorFormat) => void;
	onOpenChange?: (open: boolean) => void;

	constructor(value: string, format: ColorFormat, open: boolean) {
		this.syncValue(value);
		this.format = format;
		this.open = open;
	}

	syncValue(value: string) {
		const color = parseColorString(value);
		if (!color) return;
		this.color = color;
		this.hsv = rgbToHsv(color);
	}

	setColor = (color: ColorValue) => {
		this.color = color;
		this.hsv = rgbToHsv(color);
		this.onValueChange?.(colorToString(color, this.format));
	};

	setHsv = (hsv: HSVColorValue) => {
		this.hsv = hsv;
		this.color = hsvToRgb(hsv);
		this.onValueChange?.(colorToString(this.color, this.format));
	};

	setFormat = (format: ColorFormat) => {
		if (this.format === format) return;
		this.format = format;
		this.onFormatChange?.(format);
		this.onValueChange?.(colorToString(this.color, format));
	};

	setOpen = (open: boolean) => {
		this.open = open;
		this.onOpenChange?.(open);
	};
}

export interface ColorPickerContext {
	state: ColorPickerState;
	options: ColorPickerOptions;
}

export function setColorPickerContext(context: ColorPickerContext) {
	return setContext(COLOR_PICKER_CONTEXT, context);
}

export function getColorPickerContext(component: string) {
	const context = getContext<ColorPickerContext | undefined>(COLOR_PICKER_CONTEXT);
	if (!context) throw new Error(`${component} must be used inside ColorPicker.Root`);
	return context;
}
