import NoSleep from 'nosleep.js';
import getErrorMessage from './ErrorHelpers';

export default function enableNoSleep() {
	// I have not found a way to make it work normally
	// 'new NoSleep()' throws an error 'default is not a constructor'

	let noSleep: NoSleep;

	try {
		noSleep = new NoSleep();
	} catch {
		// it is not working
	}

	noSleep = eval('new nosleep_js_1()');

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
		false);
}