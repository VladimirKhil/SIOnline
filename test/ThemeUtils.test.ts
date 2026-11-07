import { DefaultHighlightedTextColor, TableTheme } from '../src/model/ThemeSettings';
import { generateBackgroundStyle, generateTableBackgroundProperties, generateTableTextProperties } from '../src/utils/ThemeUtils';
import settingsReducer, { setTableHighlightedTextColor } from '../src/state/settingsSlice';

describe('table text styling', () => {
	test('defaults to the original highlighted text color, including for older themes', () => {
		expect(DefaultHighlightedTextColor).toBe('#7da2ff');
		expect(settingsReducer(undefined, { type: 'init' }).theme.table.highlightedTextColor).toBe('#7da2ff');
		expect(generateTableTextProperties({})['--table-highlighted-text-color']).toBe('#7da2ff');
	});

	test('applies the selected highlight independently of normal text color and font', () => {
		const state = settingsReducer(undefined, setTableHighlightedTextColor('#ff0000'));
		expect(generateTableTextProperties({ ...state.theme.table, textColor: '#ffffff', fontFamily: 'Arial' })).toEqual({
			color: '#ffffff',
			fontFamily: 'Arial',
			'--table-highlighted-text-color': '#ff0000',
		});
	});
});

describe('table background styling', () => {
	const themes: [string, TableTheme, string][] = [
		['solid', { backgroundMode: 'solid', backgroundColor: '#123456' }, '#123456'],
		['linear gradient', {
			backgroundMode: 'linear-gradient',
			backgroundGradient: { type: 'linear', angle: 45, colors: ['#123456', '#abcdef'], positions: [10, 90] },
		}, 'linear-gradient(45deg, #123456 10%, #abcdef 90%)'],
		['radial gradient', {
			backgroundMode: 'radial-gradient',
			backgroundGradient: { type: 'radial', colors: ['#123456', '#abcdef'] },
		}, 'radial-gradient(circle, #123456, #abcdef)'],
		['image', { backgroundMode: 'image', backgroundImage: 'data:image/png;base64,abc' },
			"url('data:image/png;base64,abc')"],
	];

	test.each(themes)('%s uses the same opacity at all slider values', (_, theme, background) => {
		expect(generateBackgroundStyle(theme)).toBe(background);
		for (const alpha of [0, 50, 100]) {
			const properties = generateTableBackgroundProperties({ ...theme, backgroundAlpha: alpha });
			expect(properties.opacity).toBe(alpha / 100);
			expect(theme.backgroundMode === 'solid' ? properties.backgroundColor : properties.backgroundImage).toBe(background);
		}
	});

	test('image backgrounds are centered and cover the table', () => {
		expect(generateTableBackgroundProperties(themes[3][1])).toEqual({
			opacity: 1,
			backgroundImage: "url('data:image/png;base64,abc')",
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		});
	});

	test('older themes without a mode use their solid background', () => {
		expect(generateTableBackgroundProperties({ backgroundColor: '#123456' })).toEqual({
			opacity: 1,
			backgroundColor: '#123456',
		});
	});

	test('does not render a background when the selected mode has no background', () => {
		expect(generateTableBackgroundProperties({ backgroundMode: 'image', backgroundImage: null })).toEqual({});
	});
});
