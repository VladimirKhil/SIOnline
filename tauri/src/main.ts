import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { exit } from '@tauri-apps/plugin-process';
import { appLogDir, resolve } from '@tauri-apps/api/path';
import { openPath } from '@tauri-apps/plugin-opener';

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

let currentLogFilePath: string | null = null;

function addGameLog(content: string, newLine: boolean) {
	try {
		if (!currentLogFilePath) {
			const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
			currentLogFilePath = `game-log-${timestamp}.txt`;
		} else if (newLine) {
			content = '\n' + content;
		}

		invoke('append_text_file', { fileName: currentLogFilePath, content });

		return true;
	} catch (error) {
		console.error('Failed to write game log to file:', error);
		return false;
	}
}

async function openGameLog() {
	if (!currentLogFilePath) {
		console.warn('No game log file to open.');
		return false;
	}

	try {
		const appLog = await appLogDir();
		const fullPath = await resolve(appLog, currentLogFilePath);

		console.log(`Opening game log file: ${fullPath}`);
		await openPath(fullPath);
		return true;
	} catch (error) {
		console.error('Failed to open game log file:', error);
		return false;
	}
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

		case 'clearGameLog':
			currentLogFilePath = null;
			break;

		case 'addGameLog':
			addGameLog(event.data.payload.content, event.data.payload.newLine);
			break;

		case 'openGameLog':
			openGameLog();
			break;

		default:
			console.warn('Unknown message type:', event.data.type);
	}
});
