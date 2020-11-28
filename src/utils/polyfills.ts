// arrayBuffer polyfill
const bufferPolyfill = function (this: Blob) {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const fr = new FileReader();

		fr.onload = () => {
			if (fr.result === null) {
				reject(new Error('fr.result === null'));
				return;
			}

			if (typeof fr.result === 'string') {
				reject(new Error('typeof fr.result === \'string\''));
				return;
			}

			resolve(fr.result);
		};

		fr.readAsArrayBuffer(this);
	});
};

File.prototype.arrayBuffer = File.prototype.arrayBuffer || bufferPolyfill;
Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || bufferPolyfill;
