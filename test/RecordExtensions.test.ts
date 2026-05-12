import { create, set, remove, removeS, keys, values, map, sortRecord } from '../src/utils/RecordExtensions';

describe('create', () => {
	test('creates a record from an array using selector', () => {
		const items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
		const result = create(items, item => item.id);
		expect(result).toEqual({ 1: { id: 1, name: 'a' }, 2: { id: 2, name: 'b' } });
	});

	test('returns empty record for empty array', () => {
		expect(create([], (item: { id: number }) => item.id)).toEqual({});
	});

	test('later items overwrite earlier ones with the same key', () => {
		const items = [{ id: 1, name: 'first' }, { id: 1, name: 'second' }];
		const result = create(items, item => item.id);
		expect(result[1].name).toBe('second');
	});
});

describe('set', () => {
	test('adds a new key', () => {
		const record: Record<number, string> = { 1: 'a' };
		expect(set(record, 2, 'b')).toEqual({ 1: 'a', 2: 'b' });
	});

	test('overwrites an existing key', () => {
		const record: Record<number, string> = { 1: 'a', 2: 'b' };
		expect(set(record, 1, 'z')).toEqual({ 1: 'z', 2: 'b' });
	});

	test('does not mutate original record', () => {
		const record: Record<number, string> = { 1: 'a' };
		set(record, 2, 'b');
		expect(record).toEqual({ 1: 'a' });
	});
});

describe('remove', () => {
	test('removes a key from the record', () => {
		const record = { 1: 'a', 2: 'b', 3: 'c' };
		expect(remove(record, 2)).toEqual({ 1: 'a', 3: 'c' });
	});

	test('returns same record when key does not exist', () => {
		const record = { 1: 'a' };
		expect(remove(record, 99)).toEqual({ 1: 'a' });
	});

	test('does not mutate original record', () => {
		const record = { 1: 'a', 2: 'b' };
		remove(record, 1);
		expect(record).toEqual({ 1: 'a', 2: 'b' });
	});
});

describe('removeS', () => {
	test('removes a string key from the record', () => {
		const record = { a: 1, b: 2, c: 3 };
		expect(removeS(record, 'b')).toEqual({ a: 1, c: 3 });
	});

	test('returns same record when key does not exist', () => {
		const record = { a: 1 };
		expect(removeS(record, 'z')).toEqual({ a: 1 });
	});
});

describe('keys', () => {
	test('returns numeric keys from record', () => {
		const record = { 1: 'a', 2: 'b', 3: 'c' };
		expect(keys(record).sort((a, b) => a - b)).toEqual([1, 2, 3]);
	});

	test('returns empty array for empty record', () => {
		expect(keys({})).toEqual([]);
	});
});

describe('values', () => {
	test('returns values from numeric-keyed record', () => {
		const record = { 1: 'a', 2: 'b' };
		const result = values(record);
		expect(result.sort()).toEqual(['a', 'b']);
	});

	test('returns empty array for empty record', () => {
		expect(values({})).toEqual([]);
	});
});

describe('map', () => {
	test('applies mapper to all values', () => {
		const record = { a: 'hello', b: 'world' };
		const result = map(record, s => s.toUpperCase());
		expect(result).toEqual({ a: 'HELLO', b: 'WORLD' });
	});

	test('returns empty record for empty input', () => {
		expect(map({}, s => s)).toEqual({});
	});
});

describe('sortRecord', () => {
	test('returns key-value pairs sorted by value', () => {
		const record = { 3: 'banana', 1: 'apple', 2: 'cherry' };
		const result = sortRecord(record);
		expect(result.map(r => r.value)).toEqual(['apple', 'banana', 'cherry']);
	});

	test('returns empty array for empty record', () => {
		expect(sortRecord({})).toEqual([]);
	});

	test('preserves original numeric ids', () => {
		const record = { 5: 'b', 3: 'a' };
		const result = sortRecord(record);
		expect(result[0]).toEqual({ id: 3, value: 'a' });
		expect(result[1]).toEqual({ id: 5, value: 'b' });
	});
});
