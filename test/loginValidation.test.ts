import { validateLoginName } from '../src/utils/loginValidation';

describe('validateLoginName', () => {
	test('returns null for a valid simple name', () => {
		expect(validateLoginName('Alice')).toBeNull();
	});

	test('returns null for a name with spaces', () => {
		expect(validateLoginName('John Doe')).toBeNull();
	});

	test('returns null for a name with allowed special characters', () => {
		expect(validateLoginName('user_name-123')).toBeNull();
		expect(validateLoginName('user.name@domain')).toBeNull();
	});

	test('returns null for a name of exactly 30 characters', () => {
		const name = 'a'.repeat(30);
		expect(validateLoginName(name)).toBeNull();
	});

	test('returns error string for empty name', () => {
		const result = validateLoginName('');
		expect(result).not.toBeNull();
		expect(typeof result).toBe('string');
	});

	test('returns error string for whitespace-only name', () => {
		const result = validateLoginName('   ');
		expect(result).not.toBeNull();
		expect(typeof result).toBe('string');
	});

	test('returns error string for name exceeding 30 characters', () => {
		const name = 'a'.repeat(31);
		const result = validateLoginName(name);
		expect(result).not.toBeNull();
		expect(typeof result).toBe('string');
	});

	test('returns error string for name with invalid characters', () => {
		const result = validateLoginName('bad<script>name');
		expect(result).not.toBeNull();
		expect(typeof result).toBe('string');
	});

	test('returns error string for name with brackets', () => {
		expect(validateLoginName('user[1]')).not.toBeNull();
	});

	test('trims leading/trailing whitespace before validation', () => {
		// '  a  ' trims to 'a' which is valid
		expect(validateLoginName('  Alice  ')).toBeNull();
	});

	test('returns null for name with unicode letters', () => {
		// Unicode letters should be valid
		expect(validateLoginName('Иван')).toBeNull();
		expect(validateLoginName('张伟')).toBeNull();
	});

	test('returns null for name with digits', () => {
		expect(validateLoginName('Player123')).toBeNull();
	});

	test('31 character name after trimming fails', () => {
		const name = 'a'.repeat(31);
		expect(validateLoginName(name)).not.toBeNull();
	});
});
