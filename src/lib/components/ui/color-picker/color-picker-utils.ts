import type { ColorFormat, ColorValue, HSVColorValue } from './color-picker.types.js';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function hexToRgb(hex: string, alpha = 1): ColorValue | null {
	const normalized = hex.trim().replace(/^#/, '');
	if (!/^[\da-f]{3,8}$/i.test(normalized) || ![3, 4, 6, 8].includes(normalized.length)) return null;

	const expanded =
		normalized.length <= 4
			? [...normalized].map((character) => character.repeat(2)).join('')
			: normalized;

	return {
		r: Number.parseInt(expanded.slice(0, 2), 16),
		g: Number.parseInt(expanded.slice(2, 4), 16),
		b: Number.parseInt(expanded.slice(4, 6), 16),
		a: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : alpha
	};
}

const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');

export function rgbToHex(color: ColorValue, includeAlpha = false): string {
	const alpha = includeAlpha && color.a < 1 ? toHex(color.a * 255) : '';
	return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}${alpha}`;
}

export function rgbToHsv(color: ColorValue): HSVColorValue {
	const r = color.r / 255;
	const g = color.g / 255;
	const b = color.b / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;
	let h = 0;

	if (diff !== 0) {
		if (max === r) h = ((g - b) / diff) % 6;
		else if (max === g) h = (b - r) / diff + 2;
		else h = (r - g) / diff + 4;
	}

	h = Math.round(h * 60);
	if (h < 0) h += 360;

	return {
		h,
		s: Math.round((max === 0 ? 0 : diff / max) * 100),
		v: Math.round(max * 100),
		a: color.a
	};
}

export function hsvToRgb({ h, s, v, a }: HSVColorValue): ColorValue {
	const hue = (((h % 360) + 360) % 360) / 60;
	const saturation = clamp(s, 0, 100) / 100;
	const brightness = clamp(v, 0, 100) / 100;
	const chroma = brightness * saturation;
	const x = chroma * (1 - Math.abs((hue % 2) - 1));
	const match = brightness - chroma;
	let channels: [number, number, number];

	if (hue < 1) channels = [chroma, x, 0];
	else if (hue < 2) channels = [x, chroma, 0];
	else if (hue < 3) channels = [0, chroma, x];
	else if (hue < 4) channels = [0, x, chroma];
	else if (hue < 5) channels = [x, 0, chroma];
	else channels = [chroma, 0, x];

	return {
		r: Math.round((channels[0] + match) * 255),
		g: Math.round((channels[1] + match) * 255),
		b: Math.round((channels[2] + match) * 255),
		a: clamp(a, 0, 1)
	};
}

export function rgbToHsl(color: ColorValue) {
	const r = color.r / 255;
	const g = color.g / 255;
	const b = color.b / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;
	const lightness = (max + min) / 2;
	let hue = 0;
	let saturation = 0;

	if (diff !== 0) {
		saturation = lightness > 0.5 ? diff / (2 - max - min) : diff / (max + min);
		if (max === r) hue = (g - b) / diff + (g < b ? 6 : 0);
		else if (max === g) hue = (b - r) / diff + 2;
		else hue = (r - g) / diff + 4;
		hue /= 6;
	}

	return {
		h: Math.round(hue * 360),
		s: Math.round(saturation * 100),
		l: Math.round(lightness * 100)
	};
}

export function hslToRgb(h: number, s: number, l: number, a = 1): ColorValue {
	const hue = ((h % 360) + 360) % 360;
	const saturation = clamp(s, 0, 100) / 100;
	const lightness = clamp(l, 0, 100) / 100;
	const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
	const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
	const match = lightness - chroma / 2;
	let channels: [number, number, number];

	if (hue < 60) channels = [chroma, x, 0];
	else if (hue < 120) channels = [x, chroma, 0];
	else if (hue < 180) channels = [0, chroma, x];
	else if (hue < 240) channels = [0, x, chroma];
	else if (hue < 300) channels = [x, 0, chroma];
	else channels = [chroma, 0, x];

	return {
		r: Math.round((channels[0] + match) * 255),
		g: Math.round((channels[1] + match) * 255),
		b: Math.round((channels[2] + match) * 255),
		a: clamp(a, 0, 1)
	};
}

export function colorToString(color: ColorValue, format: ColorFormat): string {
	if (format === 'hex') return rgbToHex(color, color.a < 1);
	if (format === 'rgb') {
		return color.a < 1
			? `rgba(${color.r}, ${color.g}, ${color.b}, ${trimDecimal(color.a)})`
			: `rgb(${color.r}, ${color.g}, ${color.b})`;
	}
	if (format === 'hsl') {
		const hsl = rgbToHsl(color);
		return color.a < 1
			? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${trimDecimal(color.a)})`
			: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
	}

	const hsv = rgbToHsv(color);
	return color.a < 1
		? `hsba(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${trimDecimal(color.a)})`
		: `hsb(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
}

function trimDecimal(value: number) {
	return Number(value.toFixed(2));
}

export function parseColorString(value: string): ColorValue | null {
	const input = value.trim();
	if (input.startsWith('#')) return hexToRgb(input);

	const rgb = input.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
	if (rgb) {
		return {
			r: clamp(Number(rgb[1]), 0, 255),
			g: clamp(Number(rgb[2]), 0, 255),
			b: clamp(Number(rgb[3]), 0, 255),
			a: clamp(rgb[4] === undefined ? 1 : Number(rgb[4]), 0, 1)
		};
	}

	const hsl = input.match(
		/^hsla?\(\s*(-?[\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i
	);
	if (hsl)
		return hslToRgb(
			Number(hsl[1]),
			Number(hsl[2]),
			Number(hsl[3]),
			hsl[4] === undefined ? 1 : Number(hsl[4])
		);

	const hsb = input.match(
		/^hs(?:b|v)a?\(\s*(-?[\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i
	);
	if (hsb) {
		return hsvToRgb({
			h: Number(hsb[1]),
			s: Number(hsb[2]),
			v: Number(hsb[3]),
			a: hsb[4] === undefined ? 1 : Number(hsb[4])
		});
	}

	return null;
}
