import { swap } from '../src/utils/ArrayExtensions';

test('swap', () => {
	const data = [1, 2, 3];
	expect(swap(data, 0, 1)).toEqual([2, 1, 3]);
});