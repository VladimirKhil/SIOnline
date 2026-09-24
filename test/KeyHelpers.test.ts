import { getLayoutKeyName, getPressedKey, matchesKey } from '../src/utils/KeyHelpers';

describe('getLayoutKeyName', () => {
	test('returns letter for letter keys', () => {
		expect(getLayoutKeyName('KeyQ')).toBe('Q');
		expect(getLayoutKeyName('KeyZ')).toBe('Z');
	});

	test('returns digit for digit keys', () => {
		expect(getLayoutKeyName('Digit1')).toBe('1');
		expect(getLayoutKeyName('Digit0')).toBe('0');
	});

	test('returns US layout character for punctuation keys', () => {
		expect(getLayoutKeyName('Backquote')).toBe('`');
		expect(getLayoutKeyName('Slash')).toBe('/');
		expect(getLayoutKeyName('Backslash')).toBe('\\');
	});

	test('returns undefined for layout-independent keys', () => {
		expect(getLayoutKeyName('Space')).toBeUndefined();
		expect(getLayoutKeyName('ArrowRight')).toBeUndefined();
		expect(getLayoutKeyName('F9')).toBeUndefined();
		expect(getLayoutKeyName('ControlLeft')).toBeUndefined();
		expect(getLayoutKeyName('Numpad1')).toBeUndefined();
		expect(getLayoutKeyName('NumpadDivide')).toBeUndefined();
	});

	test('returns undefined for key values', () => {
		expect(getLayoutKeyName(' ')).toBeUndefined();
		expect(getLayoutKeyName('/')).toBeUndefined();
		expect(getLayoutKeyName('q')).toBeUndefined();
		expect(getLayoutKeyName('Control')).toBeUndefined();
	});
});

describe('getPressedKey', () => {
	test('returns physical key code for layout-dependent keys', () => {
		expect(getPressedKey({ key: 'ё', code: 'Backquote' })).toBe('Backquote');
		expect(getPressedKey({ key: '`', code: 'Backquote' })).toBe('Backquote');
		expect(getPressedKey({ key: 'Й', code: 'KeyQ' })).toBe('KeyQ');
		expect(getPressedKey({ key: '.', code: 'Slash' })).toBe('Slash');
		expect(getPressedKey({ key: 'Dead', code: 'Equal' })).toBe('Equal');
	});

	test('returns key value for other keys', () => {
		expect(getPressedKey({ key: ' ', code: 'Space' })).toBe(' ');
		expect(getPressedKey({ key: 'ArrowRight', code: 'ArrowRight' })).toBe('ArrowRight');
		expect(getPressedKey({ key: 'Control', code: 'ControlRight' })).toBe('Control');
		expect(getPressedKey({ key: 'F9', code: 'F9' })).toBe('F9');
		expect(getPressedKey({ key: '/', code: 'NumpadDivide' })).toBe('/');
		expect(getPressedKey({ key: '+', code: 'NumpadAdd' })).toBe('+');
	});
});

describe('matchesKey', () => {
	test('matches physical key code in any layout and case', () => {
		expect(matchesKey({ key: '`', code: 'Backquote' }, 'Backquote')).toBe(true);
		expect(matchesKey({ key: 'ё', code: 'Backquote' }, 'Backquote')).toBe(true);
		expect(matchesKey({ key: 'Ё', code: 'Backquote' }, 'Backquote')).toBe(true);
		expect(matchesKey({ key: 'й', code: 'KeyQ' }, 'KeyQ')).toBe(true);
		expect(matchesKey({ key: 'Q', code: 'KeyQ' }, 'KeyQ')).toBe(true);
	});

	test('does not match other physical keys producing the same character', () => {
		expect(matchesKey({ key: '/', code: 'NumpadDivide' }, 'Slash')).toBe(false);
		expect(matchesKey({ key: 'q', code: 'KeyA' }, 'KeyQ')).toBe(false);
	});

	test('matches key values', () => {
		expect(matchesKey({ key: ' ', code: 'Space' }, ' ')).toBe(true);
		expect(matchesKey({ key: 'ArrowRight', code: 'ArrowRight' }, 'ArrowRight')).toBe(true);
		expect(matchesKey({ key: 'Control', code: 'ControlLeft' }, 'Control')).toBe(true);
		expect(matchesKey({ key: 'Control', code: 'ControlRight' }, 'Control')).toBe(true);
		expect(matchesKey({ key: 'F9', code: 'F9' }, 'F9')).toBe(true);
	});

	test('keeps matching characters saved by previous versions from any key producing them', () => {
		expect(matchesKey({ key: '/', code: 'Slash' }, '/')).toBe(true);
		expect(matchesKey({ key: '/', code: 'NumpadDivide' }, '/')).toBe(true);
		expect(matchesKey({ key: '+', code: 'NumpadAdd' }, '+')).toBe(true);
		expect(matchesKey({ key: '+', code: 'Equal' }, '+')).toBe(true);
		expect(matchesKey({ key: 'ё', code: 'Backquote' }, 'ё')).toBe(true);
	});

	test('does not match other keys', () => {
		expect(matchesKey({ key: '.', code: 'Slash' }, '/')).toBe(false);
		expect(matchesKey({ key: 'F8', code: 'F8' }, 'F9')).toBe(false);
	});

	test('does not match when key is not set', () => {
		expect(matchesKey({ key: ' ', code: 'Space' }, null)).toBe(false);
		expect(matchesKey({ key: 'a', code: '' }, '')).toBe(false);
	});
});
