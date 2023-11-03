export function create<T>(collection: T[], selector: (item: T) => number): Record<number, T> {
	const result: Record<number, T> = {};

	collection.forEach((value) => {
		result[selector(value)] = value;
	});

	return result;
}

export function set<K extends keyof any, T>(record: Record<K, T>, key: K, item: T): Record<K, T> {
	return { ...record, [key]: item };
}

export function remove<T>(record: Record<number, T>, key: number): Record<number, T> {
	const { [key]: value, ...removed } = record;
	return removed;
}

export function removeS<T>(record: Record<string, T>, key: string): Record<string, T> {
	const { [key]: value, ...removed } = record;
	return removed;
}

export function keys<T>(record: Record<number, T>): number[] {
	return Object.keys(record).map(key => parseInt(key, 10));
}

export function values<T>(record: Record<number, T>): T[] {
	return Object.keys(record).map(key => record[parseInt(key, 10)]);
}

export function map<T>(record: Record<string, T>, mapper: (item: T) => T): Record<string, T> {
	return Object.keys(record).reduce(
		(value: Record<string, T>, key: string) => { value[key] = mapper(record[key]); return value; },
		{}
	);
}

export function sortRecord(record: Record<number, string>): { id: number, value: string }[] {
	const keyValueArray: { id: number, value: string }[] = [];

	for (const [key, value] of Object.entries(record)) {
		const id = parseInt(key, 10);
		keyValueArray.push({ id, value });
	}

	keyValueArray.sort((a, b) => a.value.localeCompare(b.value));
	return keyValueArray;
}
