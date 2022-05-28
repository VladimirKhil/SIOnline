export function removeFromArray<T>(array: T[], item: T): T[] {
	return array.filter(value => value !== item);
}

export function arrayToRecord<T>(array: T[], keySelector: (item: T) => string): Record<string, T> {
	return array.reduce((res: Record<string, T>, value: T) => ({ ...res, [keySelector(value)]: value }), {});
}

export function replace<T>(array: T[], index: number, item: T): T[] {
	return [...array.slice(0, index), item, ...array.slice(index + 1)];
}

export function swap<T>(array: T[], index1: number, index2: number): T[] {
	const lowIndex = Math.min(index1, index2);
	const highIndex = Math.max(index1, index2);
	const item1 = array[lowIndex];
	const item2 = array[highIndex];

	return [
		...array.slice(0, lowIndex),
		item2,
		...array.slice(lowIndex + 1, highIndex),
		item1,
		...array.slice(highIndex + 1)];
}
