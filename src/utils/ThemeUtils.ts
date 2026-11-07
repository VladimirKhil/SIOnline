import { DefaultHighlightedTextColor, TableTheme } from '../model/ThemeSettings';

export function generateTableTextProperties(theme: TableTheme): React.CSSProperties & { '--table-highlighted-text-color': string } {
	return {
		color: theme.textColor,
		fontFamily: theme.fontFamily,
		'--table-highlighted-text-color': theme.highlightedTextColor || DefaultHighlightedTextColor,
	};
}

/**
 * Generates a linear gradient CSS string.
 * @param colors Array of colors
 * @param angle Gradient angle (0-360 degrees)
 * @param positions Optional array of position percentages
 * @returns CSS linear-gradient string
 */
function generateLinearGradient(colors: string[], angle = 90, positions?: number[]): string {
	const colorStops = colors.map((color, index) => {
		const position = positions?.[index];
		return position !== undefined ? `${color} ${position}%` : color;
	}).join(', ');

	return `linear-gradient(${angle}deg, ${colorStops})`;
}

/**
 * Generates a radial gradient CSS string.
 * @param colors Array of colors
 * @param positions Optional array of position percentages
 * @returns CSS radial-gradient string
 */
function generateRadialGradient(colors: string[], positions?: number[]): string {
	const colorStops = colors.map((color, index) => {
		const position = positions?.[index];
		return position !== undefined ? `${color} ${position}%` : color;
	}).join(', ');

	return `radial-gradient(circle, ${colorStops})`;
}

/**
 * Generates the background CSS property value based on theme settings.
 * @param theme Table theme settings
 * @returns CSS background property value
 */
export function generateBackgroundStyle(theme: TableTheme): string | undefined {
	switch (theme.backgroundMode ?? 'solid') {
		case 'solid': {
			return theme.backgroundColor;
		}

		case 'linear-gradient': {
			if (!theme.backgroundGradient || !theme.backgroundGradient.colors.length) {
				return undefined;
			}
			const angle = theme.backgroundGradient.angle ?? 90;
			return generateLinearGradient(theme.backgroundGradient.colors, angle, theme.backgroundGradient.positions);
		}

		case 'radial-gradient': {
			if (!theme.backgroundGradient || !theme.backgroundGradient.colors.length) {
				return undefined;
			}
			return generateRadialGradient(theme.backgroundGradient.colors, theme.backgroundGradient.positions);
		}

		case 'image': {
			if (!theme.backgroundImage) {
				return undefined;
			}
			return `url('${theme.backgroundImage}')`;
		}

		default:
			return undefined;
	}
}

/**
 * Generates CSS properties for table background styling.
 * @param theme Table theme settings
 * @returns Object with CSS properties
 */
export function generateTableBackgroundProperties(theme: TableTheme): React.CSSProperties {
	const properties: React.CSSProperties = {};

	const backgroundValue = generateBackgroundStyle(theme);
	if (backgroundValue) {
		properties.opacity = (theme.backgroundAlpha ?? 100) / 100;
		if (theme.backgroundMode && theme.backgroundMode !== 'solid') {
			properties.backgroundImage = backgroundValue;
		} else {
			properties.backgroundColor = backgroundValue;
		}

		if (theme.backgroundMode === 'image') {
			properties.backgroundSize = 'cover';
			properties.backgroundPosition = 'center';
		}
	}

	return properties;
}
