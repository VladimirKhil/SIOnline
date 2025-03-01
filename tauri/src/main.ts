import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { exit } from '@tauri-apps/plugin-process';

async function fullScreen(fullScreen: boolean) {
	try {
		await getCurrentWebviewWindow().setFullscreen(fullScreen);
	} catch (e) {
		alert(e);
	}
}

export function setCookie(cookieName: string, cookieValue: string, expirationDays: number) {
	const d = new Date();
	d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
	const expires = 'expires=' + d.toUTCString();

	document.cookie = `${cookieName}=${cookieValue};${expires};path=/;SameSite=Lax`;
}

window.addEventListener('message', (event) => {
	switch (event.data.type) {
		case 'acceptLicense':
			setCookie('ACCEPT_LICENSE', '1', 365);
			break;

		case 'copyToClipboard':
			writeText(event.data.payload);
			break;

		case 'exit':
			exit(0);
			break;

		case 'fullscreen':
			fullScreen(event.data.payload);
			break;

		default:
			console.warn('Unknown message type:', event.data.type);
	}
});