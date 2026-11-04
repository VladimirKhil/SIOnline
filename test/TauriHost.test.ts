import TauriHost from '../src/host/TauriHost';
import RichPresence from '../src/model/RichPresence';

const presence: RichPresence = { details: 'In main menu', startTimestamp: 1000 };

function setWindow(hash: string, tauri?: { core: { invoke: jest.Mock } }) {
	const postMessage = jest.fn();

	Object.defineProperty(globalThis, 'window', {
		value: {
			__TAURI__: tauri,
			location: { hash, href: 'https://sigame.vladimirkhil.com/' },
			parent: { postMessage },
		},
		configurable: true,
		writable: true,
	});

	return postMessage;
}

describe('TauriHost.setRichPresence', () => {
	afterEach(() => {
		delete (globalThis as { window?: unknown }).window;
		jest.restoreAllMocks();
	});

	it('sends presence to the desktop shell when the shell supports it', () => {
		const postMessage = setWindow('#origin=TAURI&richPresenceSupported=true');

		new TauriHost(false).setRichPresence(presence);

		expect(postMessage).toHaveBeenCalledWith({ type: 'setRichPresence', payload: presence }, '*');
	});

	it('does not send presence to an older desktop shell', () => {
		const postMessage = setWindow('#origin=TAURI&logSupported=true');

		new TauriHost(false).setRichPresence(presence);

		expect(postMessage).not.toHaveBeenCalled();
	});

	it('invokes native command when Tauri API is available', () => {
		const invoke = jest.fn().mockResolvedValue(undefined);
		const postMessage = setWindow('', { core: { invoke } });

		new TauriHost(true).setRichPresence(presence);

		expect(invoke).toHaveBeenCalledWith('set_rich_presence', { presence });
		expect(postMessage).not.toHaveBeenCalled();
	});

	it('stops sending presence when native command is not available', async () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
		const invoke = jest.fn().mockRejectedValue('Command set_rich_presence not found');
		setWindow('', { core: { invoke } });
		const host = new TauriHost(true);

		host.setRichPresence(presence);
		await Promise.resolve();
		host.setRichPresence({ ...presence, details: 'Choosing a game' });

		expect(invoke).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledTimes(1);
	});
});
