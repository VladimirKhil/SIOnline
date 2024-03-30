import NoSleep from 'nosleep.js';
import getErrorMessage from './ErrorHelpers';

export default function enableNoSleep() {
	const noSleep = new NoSleep();

	document.addEventListener(
		'click',
		function enableNoSleepCore() {
			document.removeEventListener('click', enableNoSleepCore, false);

			try {
				noSleep.enable();
			} catch (e) {
				console.warn('NoSleep not working: ' + getErrorMessage(e));
			}
		},
		false
	);
}
