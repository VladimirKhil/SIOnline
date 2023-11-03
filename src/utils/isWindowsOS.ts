export default function isWindowsOS() {
	const { userAgent } = window.navigator;
	return /Win/i.test(userAgent);
}
