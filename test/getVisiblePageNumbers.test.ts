import getVisiblePageNumbers from '../src/utils/getVisiblePageNumbers';

test('getVisiblePageNumbers with pageIndex 0 and pageCount 1', () => {
	expect(getVisiblePageNumbers(0, 1)).toEqual([0]);
});

test('getVisiblePageNumbers with pageIndex 0 and pageCount 2', () => {
	expect(getVisiblePageNumbers(0, 2)).toEqual([0, 1]);
});

test('getVisiblePageNumbers with pageIndex 0 and pageCount 3', () => {
	expect(getVisiblePageNumbers(0, 3)).toEqual([0, 1, 2]);
});

test('getVisiblePageNumbers with pageIndex 0 and pageCount 4', () => {
	expect(getVisiblePageNumbers(0, 4)).toEqual([0, 1, 2, 3]);
});

test('getVisiblePageNumbers with pageIndex 0 and pageCount 5', () => {
	expect(getVisiblePageNumbers(0, 5)).toEqual([0, 1, 2, 3, 4]);
});

test('getVisiblePageNumbers with pageIndex 0 and pageCount 6', () => {
	expect(getVisiblePageNumbers(0, 6)).toEqual([0, 1, 2, 3, 4, 5]);
});

test('getVisiblePageNumbers with pageIndex 1 and pageCount 5', () => {
	expect(getVisiblePageNumbers(1, 50)).toEqual([0, 1, 2, 3, '...', 47, 48, 49]);
});

test('getVisiblePageNumbers with pageIndex 2 and pageCount 5', () => {
	expect(getVisiblePageNumbers(2, 50)).toEqual([0, 1, 2, 3, 4, '...', 47, 48, 49]);
});

test('getVisiblePageNumbers with pageIndex 30 and pageCount 50', () => {
	expect(getVisiblePageNumbers(30, 50)).toEqual([0, 1, 2, '...', 28, 29, 30, 31, 32, '...', 47, 48, 49]);
});