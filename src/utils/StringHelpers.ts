export default function stringFormat(string: string, ...args: string[]): string {
	return string.replace(/{(\d+)}/g, (match, index) => args[index] || '');
}

export function trimLength(value: string, maxLength: number): string {
	return value.length < maxLength ? value : value.substring(0, maxLength - 1) + '…';
}