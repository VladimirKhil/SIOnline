import { AppDispatch } from '../state/store';
import { mediaPreloadProgress } from '../state/serverActions';
import { analytics } from '../utils/Analytics';
import getErrorMessage, { getHttpErrorDetails } from '../utils/ErrorHelpers';
import localization from '../model/resources/localization';
import { logEvent } from 'firebase/analytics';

const BASE_DELAY = 500; // Base delay between requests
const MAX_RETRIES = 3;
const PRELOAD_TIMEOUT_MS = 30000;
const preloadedAudioData = new Map<string, ArrayBuffer>();

function reportContentPreloadError(contentUri: string, contentType: string, errorMessage: string): void {
	if (!analytics) {
		return;
	}

	logEvent(analytics, 'content_preload_error', {
		content_type: contentType,
		content_name: contentUri.split('/').pop()?.slice(0, 100) ?? contentUri.slice(0, 100),
		error: errorMessage.slice(0, 100),
	});
}

function withErrorCause(baseMessage: string, error: unknown): string {
	const errorCause = getErrorMessage(error).trim();
	return errorCause.length > 0 ? `${baseMessage}. ${errorCause}` : baseMessage;
}

function toContentPreloadErrorMessage(errorMessage: string): string {
	return `${localization.contentPreloadError}: ${errorMessage}`;
}

function createTimeoutError(contentType: string, contentUri: string): Error {
	return new Error(`${contentType} preload timed out after ${PRELOAD_TIMEOUT_MS}ms: ${contentUri}`);
}

function getMediaErrorCode(error: MediaError | null | undefined): number | undefined {
	return error?.code;
}

function describePreloadEventError(contentUri: string, error: Event): string {
	const target = error.currentTarget ?? error.target;
	const details = [`type=${error.type}`, `uri=${contentUri}`];

	if (target instanceof HTMLImageElement) {
		details.push(`tag=${target.tagName.toLowerCase()}`);
		details.push(`src=${target.currentSrc || target.src || contentUri}`);
	} else if (target instanceof HTMLVideoElement || target instanceof HTMLAudioElement) {
		details.push(`tag=${target.tagName.toLowerCase()}`);
		details.push(`src=${target.currentSrc || target.src || contentUri}`);
		details.push(`networkState=${target.networkState}`);
		details.push(`readyState=${target.readyState}`);

		const mediaErrorCode = getMediaErrorCode(target.error);
		if (mediaErrorCode !== undefined) {
			details.push(`mediaErrorCode=${mediaErrorCode}`);
		}
	} else if (target instanceof HTMLIFrameElement) {
		details.push(`tag=${target.tagName.toLowerCase()}`);
		details.push(`src=${target.src || contentUri}`);
	}

	return details.join(', ');
}

async function fetchWithTimeout(contentUri: string, contentType: string): Promise<Response> {
	const abortController = new AbortController();
	const timeoutId = globalThis.setTimeout(() => abortController.abort(), PRELOAD_TIMEOUT_MS);

	try {
		const response = await fetch(contentUri, { signal: abortController.signal });

		if (!response.ok) {
			throw new Error(await getHttpErrorDetails(response));
		}

		return response;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw createTimeoutError(contentType, contentUri);
		}

		throw error;
	} finally {
		globalThis.clearTimeout(timeoutId);
	}
}

export function getPreloadedAudioData(contentUri: string): ArrayBuffer | undefined {
	const data = preloadedAudioData.get(contentUri);

	return data?.slice(0);
}

export function clearPreloadedRoundContent(): void {
	preloadedAudioData.clear();
}

/**
 * Helper function to preload a single file with retry logic using actual DOM elements
 */
function preloadFile(contentUri: string, addSimpleMessage: (message: string) => void, retryCount = 0): Promise<void> {
	return new Promise((resolve, reject) => {
		// Determine file type from URI
		const isVideo = /\.(mp4|webm|ogv)$/i.test(contentUri);
		const isAudio = /\.(mp3|wav|ogg|oga|opus|m4a|aac)$/i.test(contentUri);
		const isHtml = /\.(html|htm)$/i.test(contentUri);

		let element: HTMLImageElement | HTMLVideoElement | HTMLAudioElement | HTMLIFrameElement;

		if (isVideo) {
			element = document.createElement('video');
			(element as HTMLVideoElement).preload = 'auto';
			(element as HTMLVideoElement).crossOrigin = 'anonymous';
		} else if (isAudio) {
			if (preloadedAudioData.has(contentUri)) {
				resolve();
				return;
			}

			fetchWithTimeout(contentUri, 'Audio')
				.then(response => response.arrayBuffer())
				.then(arrayBuffer => {
					preloadedAudioData.set(contentUri, arrayBuffer);
					resolve();
				})
				.catch(error => {
					if (retryCount < MAX_RETRIES) {
						const retryDelay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 5000);
						console.log(`Retrying preload of ${contentUri} (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${retryDelay}ms`);

						setTimeout(() => {
							preloadFile(contentUri, addSimpleMessage, retryCount + 1).then(resolve).catch(reject);
						}, retryDelay);
					} else {
						const errorMessage = withErrorCause(`Failed to load audio: ${contentUri}`, error);
						console.warn(`Failed to preload ${contentUri} after ${MAX_RETRIES} attempts: ${error}`);
						reportContentPreloadError(contentUri, 'audio', errorMessage);
						addSimpleMessage(toContentPreloadErrorMessage(errorMessage));
						resolve();
					}
				});

			return;
		} else if (isHtml) {
			// For HTML content, use fetch to load and cache it
			fetchWithTimeout(contentUri, 'HTML')
				.then(response => response.text())
				.then(() => {
					resolve();
				})
				.catch(error => {
					if (retryCount < MAX_RETRIES) {
						const retryDelay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 5000);
						console.log(`Retrying preload of ${contentUri} (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${retryDelay}ms`);

						setTimeout(() => {
							preloadFile(contentUri, addSimpleMessage, retryCount + 1).then(resolve).catch(reject);
						}, retryDelay);
					} else {
						const errorMessage = withErrorCause(`Failed to load HTML: ${contentUri}`, error);
						console.warn(`Failed to preload ${contentUri} after ${MAX_RETRIES} attempts: ${error}`);
						reportContentPreloadError(contentUri, 'html', errorMessage);
						addSimpleMessage(toContentPreloadErrorMessage(errorMessage));
						// Don't reject - just log the failure and continue
						resolve();
					}
				});
			return;
		} else {
			// Assume image for everything else
			element = new Image();
		}

		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const clearElementHandlers = () => {
			element.onload = null;
			element.onerror = null;
			if ('onloadeddata' in element) {
				(element as HTMLVideoElement).onloadeddata = null;
			}
			if (timeoutId !== null) {
				globalThis.clearTimeout(timeoutId);
				timeoutId = null;
			}
		};

		const handleSuccess = () => {
			clearElementHandlers();

			if (element instanceof HTMLVideoElement) {
				element.src = '';
				element.load(); // aborts network, releases pipeline
			} else if (element instanceof HTMLImageElement) {
				element.src = '';
			}

			resolve();
		};

		const handleError = (error: Event | string) => {
			clearElementHandlers();

			if (element instanceof HTMLVideoElement) {
				element.src = '';
				element.load();
			} else if (element instanceof HTMLImageElement) {
				element.src = '';
			}

			if (retryCount < MAX_RETRIES) {
				const retryDelay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 5000);
				console.log(`Retrying preload of ${contentUri} (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${retryDelay}ms`);

				setTimeout(() => {
					preloadFile(contentUri, addSimpleMessage, retryCount + 1).then(resolve).catch(reject);
				}, retryDelay);
			} else {
				const errorMessage = error instanceof Event ? describePreloadEventError(contentUri, error) : String(error);
				console.warn(`Failed to preload ${contentUri} after ${MAX_RETRIES} attempts: ${errorMessage}`);
				reportContentPreloadError(contentUri, isVideo ? 'video' : 'image', errorMessage);
				addSimpleMessage(toContentPreloadErrorMessage(errorMessage));
				// Don't reject - just log the failure and continue
				resolve();
			}
		};

		// Set up event listeners
		if (isVideo) {
			(element as HTMLVideoElement).onloadeddata = handleSuccess;
		} else {
			element.onload = handleSuccess;
		}
		element.onerror = handleError;
		timeoutId = globalThis.setTimeout(() => {
			if (element instanceof HTMLVideoElement) {
				element.src = '';
				element.load();
			} else if (element instanceof HTMLImageElement) {
				element.src = '';
			}

			handleError(createTimeoutError(isVideo ? 'Video' : 'Image', contentUri).message);
		}, PRELOAD_TIMEOUT_MS);

		// Start loading by setting src
		element.src = contentUri;
	});
}

/**
 * Preload round content (images, videos, audio, HTML files) with progress tracking.
 * Requests are intentionally sequential to avoid triggering the server rate limiter.
 * @param content Array of content URIs to preload
 * @param preprocessServerUri Function to preprocess server URIs
 * @param isExternalUri Function to check if URI is external (external URIs are skipped)
 * @param appDispatch Redux dispatch function
 * @param addSimpleMessage Function to add simple messages (for error reporting)
 */
export async function preloadRoundContent(
	content: string[],
	preprocessServerUri: (uri: string) => string,
	isExternalUri: (uri: string) => boolean,
	appDispatch: AppDispatch,
	addSimpleMessage: (message: string) => void
): Promise<void> {
	let lastNotifiedProgressTens = 0;

	// Helper function to notify progress at 10% intervals
	const notifyProgress = (progress: number) => {
		const progressPercent = Math.floor(progress * 100);
		const progressTens = Math.floor(progressPercent / 10) * 10;

		if (progressTens > lastNotifiedProgressTens && progressTens >= 10) {
			lastNotifiedProgressTens = progressTens;
			appDispatch(mediaPreloadProgress(progressPercent));
		}
	};

	clearPreloadedRoundContent();

	// Helper function to delay between requests
	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	// Process files one by one, skipping external ones
	for (let i = 0; i < content.length; i += 1) {
		const url = content[i];
		const contentUri = preprocessServerUri(url);

		// Skip external media files
		if (isExternalUri(contentUri)) {
			continue;
		}

		// Add delay between requests (except for first processed request)
		if (i > 0) {
			// eslint-disable-next-line no-await-in-loop
			await delay(BASE_DELAY);
		}

		try {
			// eslint-disable-next-line no-await-in-loop
			await preloadFile(contentUri, addSimpleMessage);
		} catch (error) {
			// Continue processing even if this file failed
			console.error(`Failed to preload ${url}: ${getErrorMessage(error)}`);
		}

		// Calculate and notify progress after each file
		const progress = (i + 1) / content.length;
		notifyProgress(progress);
	}

	// Ensure 100% is always notified at the end
	if (lastNotifiedProgressTens < 100) {
		appDispatch(mediaPreloadProgress(100));
	}
}
