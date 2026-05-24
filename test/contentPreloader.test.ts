import { preloadRoundContent } from '../src/logic/contentPreloader';

describe('contentPreloader', () => {
	jest.setTimeout(15000);

	const flushMicrotasks = async () => {
		await Promise.resolve();
		await Promise.resolve();
	};

	const runNextTimer = async () => {
		jest.runOnlyPendingTimers();
		await flushMicrotasks();
	};

	beforeEach(() => {
		Object.defineProperty(globalThis, 'performance', {
			configurable: true,
			writable: true,
			value: globalThis.performance,
		});

		jest.useFakeTimers('legacy');
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	test('times out a hanging audio preload and continues with the next queued file', async () => {
		const appDispatch = jest.fn();
		const addSimpleMessage = jest.fn();
		const firstUrl = 'https://example.com/hanging.mp3';
		const secondUrl = 'https://example.com/ready.mp3';
		let firstAttempts = 0;

		global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
			const url = String(input);

			if (url === firstUrl) {
				firstAttempts += 1;

				return new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener('abort', () => {
						const abortError = new Error('The operation was aborted.');
						abortError.name = 'AbortError';
						reject(abortError);
					});
				});
			}

			return Promise.resolve({
				ok: true,
				arrayBuffer: async () => new ArrayBuffer(8),
			} as Response);
		}) as typeof fetch;

		void preloadRoundContent(
			[firstUrl, secondUrl],
			uri => uri,
			() => false,
			appDispatch as never,
			addSimpleMessage,
		);

		await flushMicrotasks();
		await runNextTimer();
		await runNextTimer();
		await runNextTimer();
		await runNextTimer();
		await runNextTimer();
		await runNextTimer();
		await runNextTimer();
		await runNextTimer();
		await flushMicrotasks();
		await runNextTimer();
		await flushMicrotasks();

		expect(firstAttempts).toBe(4);
		expect(global.fetch).toHaveBeenCalledWith(firstUrl, expect.objectContaining({ signal: expect.any(AbortSignal) }));
		expect(global.fetch).toHaveBeenCalledWith(secondUrl, expect.objectContaining({ signal: expect.any(AbortSignal) }));
		expect(addSimpleMessage).toHaveBeenCalledWith(expect.stringContaining('timed out after 30000ms'));
	});
});
