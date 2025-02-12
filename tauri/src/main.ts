import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

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
	if (event.data.type === 'fullscreen') {
		fullScreen(event.data.payload);
	} else if (event.data.type === 'acceptLicense') {
		setCookie('ACCEPT_LICENSE', '1', 365);
	}
});