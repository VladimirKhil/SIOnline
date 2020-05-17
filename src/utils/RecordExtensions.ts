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

export function values<T>(record: Record<number, T>): T[] {
	return Object.keys(record).map(key => record[parseInt(key, 10)]);
}

export function map<T>(record: Record<string, T>, mapper: (item: T) => T): Record<string, T> {
	return Object.keys(record).reduce(
		(value: Record<string, T>, key: string) => { value[key] = mapper(record[key]); return value; },
		{}
	);
}
