export default function stringFormat(string: string, ...args: string[]): string {
	return string.replace(/{(\d+)}/g, (match, index) => args[index] || '');
}
