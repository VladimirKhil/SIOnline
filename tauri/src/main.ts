import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

async function fullScreen(fullScreen: boolean) {
	try {
		await getCurrentWebviewWindow().setFullscreen(fullScreen);
	} catch (e) {
		alert(e);
	}
}

window.addEventListener('message', (event) => {
	if (event.data.type === 'fullscreen') {
		fullScreen(event.data.payload);
	}
});