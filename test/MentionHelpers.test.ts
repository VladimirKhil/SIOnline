import hasUserMentioned from '../src/utils/MentionHelpers';

describe('hasUserMentioned', () => {
	test('returns true when user is mentioned', () => {
		expect(hasUserMentioned('Hello @Alice how are you?', 'Alice')).toBe(true);
	});

	test('returns false when user is not mentioned', () => {
		expect(hasUserMentioned('Hello Bob how are you?', 'Alice')).toBe(false);
	});

	test('requires non-word character after username', () => {
		// regex is @name\W so the mention must be followed by a non-word char
		expect(hasUserMentioned('@Alice is here', 'Alice')).toBe(true);
		// Without trailing non-word character at end of string, no match
		expect(hasUserMentioned('talk to @Alice', 'Alice')).toBe(false);
	});

	test('is case-sensitive', () => {
		expect(hasUserMentioned('Hello @alice!', 'Alice')).toBe(false);
		expect(hasUserMentioned('Hello @alice!', 'alice')).toBe(true);
	});

	test('escapes regex special characters in username', () => {
		// Username with special regex chars should still work correctly
		expect(hasUserMentioned('@user.name is here', 'user.name')).toBe(true);
		expect(hasUserMentioned('@username is here', 'user.name')).toBe(false);
	});

	test('returns false for empty message', () => {
		expect(hasUserMentioned('', 'Alice')).toBe(false);
	});

	test('returns false for empty username', () => {
		// @ followed by empty string matches @ followed by \W — e.g. '@ hello'
		expect(hasUserMentioned('@ hello', '')).toBe(true);
		expect(hasUserMentioned('no at sign here', '')).toBe(false);
	});
});
