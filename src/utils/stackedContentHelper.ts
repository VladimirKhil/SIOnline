function getBestItemSize(rowCount: number, columnCount: number, aspectRatio: number = 16 / 9): number {
	return Math.min(1.0 / rowCount, aspectRatio / columnCount);
}

export default function getBestRowColumnCount(itemCount: number, aspectRatio: number = 16 / 9): { rowCount: number; columnCount: number } {
	let bestRowCount = 1;
	let bestColumnCount = itemCount / bestRowCount;
	let bestItemSize = getBestItemSize(bestRowCount, bestColumnCount, aspectRatio);

	for (let rowCount = 2; rowCount <= itemCount; rowCount++) {
		const columnCount = Math.ceil(itemCount / rowCount);
		const itemSize = getBestItemSize(rowCount, columnCount, aspectRatio);

		if (itemSize > bestItemSize) {
			bestItemSize = itemSize;
			bestRowCount = rowCount;
			bestColumnCount = columnCount;
		}
	}

	return { rowCount: bestRowCount, columnCount: bestColumnCount };
}