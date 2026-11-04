const extensionRegex = /(?:\.([^.]+))?$/;

export default function getExtension(file: string): string | null {
	const result = extensionRegex.exec(file);
	return result && result.length > 0 ? result[1] : null;
}

export function decodeMediaFileName(fileName: string): string {
	try {
		return decodeURIComponent(fileName);
	} catch {
		return fileName;
	}
}

/**
 * Sanitizes a filename from invalid characters for cross-platform compatibility.
 */
export function sanitizeFilename(fileName: string): string {
	if (!fileName) {
		return 'untitled';
	}

	// Reserved Windows device names
	const WIN_RESERVED_NAMES = new Set([
		'CON',
		'PRN',
		'AUX',
		'NUL',
		'CONIN$',
		'CONOUT$',
		...Array.from({ length: 10 }, (_, i) => `COM${i}`),
		...Array.from({ length: 10 }, (_, i) => `LPT${i}`),
	]);

	// Replace invalid Windows/Linux characters, C0 (0-31), DEL (127), and C1 (128-159)
	let sanitized = fileName.replace(/[<>:"/\\|?*\p{Control}]/gu, '_');

	// Collapse multiple whitespace characters into a single space and trim edges
	sanitized = sanitized.replace(/\s+/g, ' ').trim();

	// Separate stem and extension
	const lastDotIndex = sanitized.lastIndexOf('.');
	let stem = sanitized;
	let ext = '';

	if (lastDotIndex > 0) {
		stem = sanitized.slice(0, lastDotIndex);
		ext = sanitized.slice(lastDotIndex);
	}

	// Remove invalid trailing dots and spaces from both parts
	stem = stem.replace(/[. ]+$/, '');
	ext = ext.replace(/[. ]+$/, '');

	if (!stem) {
		stem = 'untitled';
	}

	// Check for reserved Windows device names
	// NFKD normalization converts superscript numbers (e.g., COM¹) to regular digits (COM1) for inspection
	const normalizedStem = stem.normalize('NFKD').toUpperCase();

	if (WIN_RESERVED_NAMES.has(normalizedStem)) {
		stem = `${stem}_`;
	}

	// Assemble the filename back
	const result = `${stem}${ext}`.replace(/[. ]+$/, '');

	return result || 'untitled';
}