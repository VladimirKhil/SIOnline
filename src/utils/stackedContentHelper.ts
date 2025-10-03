function getBestItemSize(rowCount: number, columnCount: number): number {
	return Math.min(9.0 / rowCount, 16.0 / columnCount);
}

export default function getBestRowColumnCount(itemCount: number): { rowCount: number; columnCount: number } {
	let bestRowCount = 1;
	let bestColumnCount = itemCount / bestRowCount;
	let bestItemSize = getBestItemSize(bestRowCount, bestColumnCount);

	for (let rowCount = 2; rowCount <= itemCount; rowCount++) {
		const columnCount = Math.ceil(itemCount / rowCount);
		const itemSize = getBestItemSize(rowCount, columnCount);

		if (itemSize > bestItemSize) {
			bestItemSize = itemSize;
			bestRowCount = rowCount;
			bestColumnCount = columnCount;
		}
	}

	return { rowCount: bestRowCount, columnCount: bestColumnCount };
}