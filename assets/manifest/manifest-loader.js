module.exports = function loadManifest(options, loaderContext, content) {
	const json = JSON.parse(content);

	if (json.icons) {
		json.icons.forEach(icon => {
			if (icon.src) {
				// TODO: Import icon.src and emit it into dist folder
			}
		});
	}

	return {
		cacheable: true,
		code: JSON.stringify(json, null, 2),
	};
};