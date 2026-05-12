import clearUrls from '../src/utils/clearUrls';

describe('clearUrls', () => {
	test('removes http URL from text', () => {
		expect(clearUrls('Visit http://example.com for more')).toBe('Visit  for more');
	});

	test('removes https URL from text', () => {
		expect(clearUrls('Go to https://example.com/path?q=1 now')).toBe('Go to  now');
	});

	test('removes ftp URL from text', () => {
		expect(clearUrls('Download from ftp://files.example.com/file.zip done')).toBe('Download from  done');
	});

	test('removes multiple URLs', () => {
		const result = clearUrls('See http://a.com and https://b.com for details');
		expect(result).toBe('See  and  for details');
	});

	test('returns unchanged text with no URLs', () => {
		expect(clearUrls('No links here')).toBe('No links here');
	});

	test('handles empty string', () => {
		expect(clearUrls('')).toBe('');
	});

	test('removes URL at start of string', () => {
		expect(clearUrls('https://example.com is great')).toBe(' is great');
	});

	test('removes URL at end of string', () => {
		expect(clearUrls('Check out https://example.com')).toBe('Check out ');
	});
});
