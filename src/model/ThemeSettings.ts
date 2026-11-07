export type BackgroundMode = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image';

export const DefaultHighlightedTextColor = '#7da2ff';

export interface BackgroundGradient {
	type: 'linear' | 'radial';
	angle?: number; // for linear: 0-360 degrees
	colors: string[]; // array of color stops with optional positions
	positions?: number[]; // optional position percentages (0-100)
}

export interface TableTheme {
	textColor?: string;
	backgroundColor?: string;
	backgroundAlpha?: number; // 0-100, where 100 is opaque
	highlightedTextColor?: string;
	fontFamily?: string;
	isHexagonal?: boolean;
	backgroundMode?: BackgroundMode;
	backgroundImage?: string | null; // base64 encoded
	backgroundGradient?: BackgroundGradient;
}

export default interface ThemeSettings {
	table: TableTheme;
	room: {
		backgroundImageKey: string | null;
	}
}