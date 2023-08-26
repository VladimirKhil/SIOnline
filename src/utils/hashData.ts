import * as Rusha from 'rusha';

export default async function hashData(data: ArrayBuffer): Promise<ArrayBuffer> {
	if (location.protocol === 'https:') {
		return crypto.subtle.digest('SHA-1', data); // It works only under HTTPS protocol
	}

	return Rusha.createHash().update(data).digest();
}