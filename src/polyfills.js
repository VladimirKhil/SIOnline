// arrayBuffer polyfill
const bufferPolyfill = function () {
  return new Promise((resolve) => {
    let fr = new FileReader();
    fr.onload = function () {
      resolve(fr.result);
    };
    fr.readAsArrayBuffer(this);
  });
};
File.prototype.arrayBuffer = File.prototype.arrayBuffer || bufferPolyfill;
Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || bufferPolyfill;
