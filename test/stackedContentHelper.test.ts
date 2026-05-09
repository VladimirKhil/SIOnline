import getBestRowColumnCount from '../src/utils/stackedContentHelper';

describe('getBestRowColumnCount', () => {
	test('1 item: 1 row, 1 column', () => {
		expect(getBestRowColumnCount(1)).toEqual({ rowCount: 1, columnCount: 1 });
	});

	test('2 items: returns a valid layout', () => {
		const { rowCount, columnCount } = getBestRowColumnCount(2);
		expect(rowCount * columnCount).toBeGreaterThanOrEqual(2);
		expect(rowCount).toBeGreaterThanOrEqual(1);
		expect(columnCount).toBeGreaterThanOrEqual(1);
	});

	test('4 items: returns 2x2 layout (square is optimal for 16:9)', () => {
		const { rowCount, columnCount } = getBestRowColumnCount(4);
		expect(rowCount).toBe(2);
		expect(columnCount).toBe(2);
	});

	test('6 items: returns 2x3 or 3x2 layout', () => {
		const { rowCount, columnCount } = getBestRowColumnCount(6);
		expect(rowCount * columnCount).toBeGreaterThanOrEqual(6);
	});

	test('total cells cover all items', () => {
		for (let count = 1; count <= 12; count++) {
			const { rowCount, columnCount } = getBestRowColumnCount(count);
			expect(rowCount * columnCount).toBeGreaterThanOrEqual(count);
		}
	});

	test('rowCount and columnCount are positive integers', () => {
		for (let count = 1; count <= 8; count++) {
			const { rowCount, columnCount } = getBestRowColumnCount(count);
			expect(Number.isInteger(rowCount)).toBe(true);
			expect(Number.isInteger(columnCount)).toBe(true);
			expect(rowCount).toBeGreaterThan(0);
			expect(columnCount).toBeGreaterThan(0);
		}
	});

	test('accepts custom aspect ratio', () => {
		// With a square (1:1) aspect ratio, more rows may be preferred
		const { rowCount, columnCount } = getBestRowColumnCount(4, 1);
		expect(rowCount * columnCount).toBeGreaterThanOrEqual(4);
	});
});
