import { swap, removeFromArray, arrayToRecord, arrayToValue, replace } from '../src/utils/ArrayExtensions';

test('swap', () => {
	const data = [1, 2, 3];
	expect(swap(data, 0, 1)).toEqual([2, 1, 3]);
});

describe('removeFromArray', () => {
	test('removes all occurrences of the item', () => {
		// filter removes all matching items, not just the first
		expect(removeFromArray([1, 2, 3, 2], 2)).toEqual([1, 3]);
	});

	test('returns array unchanged if item not found', () => {
		expect(removeFromArray([1, 2, 3], 99)).toEqual([1, 2, 3]);
	});

	test('returns empty array when all items match', () => {
		expect(removeFromArray([1, 1, 1], 1)).toEqual([]);
	});

	test('does not mutate the original array', () => {
		const arr = [1, 2, 3];
		removeFromArray(arr, 2);
		expect(arr).toEqual([1, 2, 3]);
	});
});

describe('arrayToRecord', () => {
	test('creates record keyed by string selector', () => {
		const items = [{ id: 'a', val: 1 }, { id: 'b', val: 2 }];
		const result = arrayToRecord(items, item => item.id);
		expect(result).toEqual({ a: { id: 'a', val: 1 }, b: { id: 'b', val: 2 } });
	});

	test('creates record keyed by number selector', () => {
		const items = [{ id: 1, val: 'x' }, { id: 2, val: 'y' }];
		const result = arrayToRecord(items, item => item.id);
		expect(result[1]).toEqual({ id: 1, val: 'x' });
		expect(result[2]).toEqual({ id: 2, val: 'y' });
	});

	test('returns empty record for empty array', () => {
		expect(arrayToRecord([], (x: { id: string }) => x.id)).toEqual({});
	});
});

describe('arrayToValue', () => {
	test('creates record mapping key to extracted value', () => {
		const items = [{ id: 'a', val: 10 }, { id: 'b', val: 20 }];
		const result = arrayToValue(items, item => item.id, item => item.val);
		expect(result).toEqual({ a: 10, b: 20 });
	});

	test('returns empty record for empty array', () => {
		expect(arrayToValue([], (x: { id: string }) => x.id, (x) => x)).toEqual({});
	});
});

describe('replace', () => {
	test('replaces element at given index', () => {
		expect(replace([1, 2, 3], 1, 99)).toEqual([1, 99, 3]);
	});

	test('replaces first element', () => {
		expect(replace([1, 2, 3], 0, 0)).toEqual([0, 2, 3]);
	});

	test('replaces last element', () => {
		expect(replace([1, 2, 3], 2, 42)).toEqual([1, 2, 42]);
	});

	test('does not mutate original array', () => {
		const arr = [1, 2, 3];
		replace(arr, 0, 99);
		expect(arr).toEqual([1, 2, 3]);
	});
});

describe('swap (additional cases)', () => {
	test('swap adjacent elements', () => {
		expect(swap([1, 2, 3, 4], 1, 2)).toEqual([1, 3, 2, 4]);
	});

	test('swap first and last', () => {
		expect(swap([1, 2, 3, 4], 0, 3)).toEqual([4, 2, 3, 1]);
	});
});