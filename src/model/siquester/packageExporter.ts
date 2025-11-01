import JSZip from 'jszip';
import { Package } from './package';
import { serializePackageToXML } from './packageSerializer';

/**
 * Creates a SIQ file (ZIP with content.xml) from a Package and triggers download
 */
export async function downloadPackageAsSIQ(pack: Package, zip?: JSZip): Promise<void> {
	try {
		// Create new ZIP or use existing one
		const packageZip = zip || new JSZip();

		// Serialize package to XML
		const xmlContent = serializePackageToXML(pack);

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
