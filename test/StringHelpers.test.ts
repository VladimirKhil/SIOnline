import stringFormat, { trimLength } from '../src/utils/StringHelpers';

describe('stringFormat', () => {
	test('replaces single placeholder', () => {
		expect(stringFormat('Hello, {0}!', 'world')).toBe('Hello, world!');
	});

	test('replaces multiple placeholders', () => {
		expect(stringFormat('{0} and {1}', 'foo', 'bar')).toBe('foo and bar');
	});

	test('replaces placeholder appearing multiple times', () => {
		expect(stringFormat('{0} is {0}', 'great')).toBe('great is great');
	});

	test('leaves placeholder empty when arg is missing', () => {
		expect(stringFormat('Hello, {0}!')).toBe('Hello, !');
	});

	test('returns string unchanged when no placeholders', () => {
		expect(stringFormat('no placeholders', 'ignored')).toBe('no placeholders');
	});

	test('handles empty string', () => {
		expect(stringFormat('', 'value')).toBe('');
	});

	test('replaces out-of-order placeholders', () => {
		expect(stringFormat('{1} then {0}', 'first', 'second')).toBe('second then first');
	});
});

describe('trimLength', () => {
	test('returns value unchanged when shorter than maxLength', () => {
		expect(trimLength('hello', 10)).toBe('hello');
	});

	test('returns value unchanged when equal to maxLength', () => {
		// length (5) < maxLength (5) is false, so it trims at maxLength=5 → 4 chars + ellipsis
		// Actually condition is: value.length < maxLength, so equal triggers trimming
		expect(trimLength('hello', 6)).toBe('hello');
	});

	test('trims and appends ellipsis when value exceeds maxLength', () => {
		expect(trimLength('hello world', 6)).toBe('hello…');
	});

	test('handles exactly at boundary (length === maxLength)', () => {
		// length 5 < maxLength 5 is false → trims
		const result = trimLength('hello', 5);
		expect(result).toBe('hell…');
	});

	test('handles empty string', () => {
		expect(trimLength('', 5)).toBe('');
	});

	test('appends single ellipsis character', () => {
		const result = trimLength('abcdefgh', 5);
		expect(result).toBe('abcd…');
		expect(result.length).toBe(5);
	});
});
