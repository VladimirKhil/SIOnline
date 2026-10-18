import JSZip from 'jszip';
import { getPackageFiles } from '../src/model/siquester/packageExporter';

describe('getPackageFiles', () => {
	test('returns archive file names and uppercase SHA-256 hashes', async () => {
		const zip = new JSZip();
		zip.file('Images/абвг.png', 'hello');

		await expect(getPackageFiles(zip)).resolves.toEqual([
			{
				name: 'Images/абвг.png',
				hash: '2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824',
			},
		]);
	});

	test('excludes generated package metadata and directories', async () => {
		const zip = new JSZip();
		zip.folder('Images');
		zip.file('content.xml', 'previous xml');
		zip.file('quality.marker', '');

		await expect(getPackageFiles(zip)).resolves.toEqual([]);
	});
});
