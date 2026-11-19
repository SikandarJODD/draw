import type { Snippet } from 'svelte';

export const colorFormats = ['hex', 'rgb', 'hsl', 'hsb'] as const;

export type ColorFormat = (typeof colorFormats)[number];
export type Direction = 'ltr' | 'rtl';

export interface ColorValue {
	r: number;
	g: number;
	b: number;
	a: number;
}

export interface HSVColorValue {
	h: number;
	s: number;
	v: number;
	a: number;
}

export interface ColorPickerOptions {
	dir: Direction;
	disabled: boolean;
	inline: boolean;
	readOnly: boolean;
	required: boolean;
}

export interface ColorPickerChildProps {
	children?: Snippet;
	class?: string;
}

export interface EyeDropperResult {
	sRGBHex: string;
}

export interface EyeDropperInstance {
	open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>;
}

export interface EyeDropperConstructor {
	new (): EyeDropperInstance;
}

export type FormatInputProps = {
	color: ColorValue;
	hsv: HSVColorValue;
	disabled: boolean;
	withoutAlpha: boolean;
	onColorChange: (color: ColorValue) => void;
	class?: string;
	placeholder?: string;
};
