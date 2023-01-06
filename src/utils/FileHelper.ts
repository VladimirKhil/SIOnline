const extensionRegex = /(?:\.([^.]+))?$/;

export default function getExtension(file: string): string | null {
	const result = extensionRegex.exec(file);
	return result && result.length > 0 ? result[1] : null;
}