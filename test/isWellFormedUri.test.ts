import isWellFormedUri from '../src/utils/isWellFormedUri';

describe('isWellFormedUri', () => {
	test('returns true for a valid http URL', () => {
		expect(isWellFormedUri('http://example.com')).toBe(true);
	});

	test('returns true for a valid https URL', () => {
		expect(isWellFormedUri('https://example.com/path?query=1#anchor')).toBe(true);
	});

	test('returns true for a valid ftp URL', () => {
		expect(isWellFormedUri('ftp://files.example.com')).toBe(true);
	});

	test('returns false for a relative path', () => {
		expect(isWellFormedUri('/relative/path')).toBe(false);
	});

	test('returns false for plain text', () => {
		expect(isWellFormedUri('not a url')).toBe(false);
	});

	test('returns false for empty string', () => {
		expect(isWellFormedUri('')).toBe(false);
	});

	test('returns true for URL with port', () => {
		expect(isWellFormedUri('https://example.com:8080/api')).toBe(true);
	});

	test('returns true for localhost URL', () => {
		expect(isWellFormedUri('http://localhost:3000')).toBe(true);
	});

	test('returns false for a string missing protocol', () => {
		expect(isWellFormedUri('example.com')).toBe(false);
	});
});
