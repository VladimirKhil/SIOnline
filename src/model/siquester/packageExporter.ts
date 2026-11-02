import JSZip from 'jszip';
import { Package, PackageFile } from './package';
import { serializePackageToXML } from './packageSerializer';

async function getPackageFile(file: JSZip.JSZipObject): Promise<PackageFile> {
	const content = await file.async('arraybuffer');
	const digest = await globalThis.crypto.subtle.digest('SHA-256', content);
	const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
	return { name: file.name, hash };
}

export async function getPackageFiles(zip: JSZip): Promise<PackageFile[]> {
	if (!globalThis.crypto?.subtle) {
		throw new Error('Web Crypto API is required to calculate package file hashes');
	}

	const files: PackageFile[] = [];
	for (const file of Object.values(zip.files)) {
		if (file.dir || file.name === 'content.xml' || file.name === 'quality.marker') {
			continue;
		}

		// Process one file at a time to avoid loading all media into memory simultaneously.
		// eslint-disable-next-line no-await-in-loop
		files.push(await getPackageFile(file));
	}

	return files;
}

/**
 * Creates a SIQ file (ZIP with content.xml) from a Package and triggers download
 */
export async function downloadPackageAsSIQ(pack: Package, zip?: JSZip): Promise<void> {
	try {
		// Create new ZIP or use existing one
		const packageZip = zip || new JSZip();

		// Hash archive files before adding the generated content.xml
		const files = await getPackageFiles(packageZip);

		// Serialize package to XML
		const xmlContent = serializePackageToXML(pack, files);

		// Add content.xml to ZIP
		packageZip.file('content.xml', xmlContent);

		// Add quality.marker file if package has quality mark
		if (pack.isQualityMarked) {
			packageZip.file('quality.marker', '');
		}

		// Generate ZIP file
		const blob = await packageZip.generateAsync({ type: 'blob' });

		// Create download link
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;

		// Sanitize package name for filename
		const sanitizedName = pack.name.replace(/[<>:"/\\|?*]/g, '_') || 'package';
		link.download = `${sanitizedName}.siq`;

		// Trigger download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Clean up
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Failed to download package as SIQ:', error);
		throw error;
	}
}
