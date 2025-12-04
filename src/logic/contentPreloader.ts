import { AppDispatch } from '../state/store';
import { mediaPreloaded, mediaPreloadProgress } from '../state/serverActions';
import getErrorMessage from '../utils/ErrorHelpers';

const BASE_DELAY = 500; // Base delay between requests
const MAX_RETRIES = 3;

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
			element = document.createElement('audio');
			(element as HTMLAudioElement).preload = 'auto';
			(element as HTMLAudioElement).crossOrigin = 'anonymous';
		} else if (isHtml) {
			// For HTML content, use fetch to load and cache it
			fetch(contentUri)
				.then(response => {
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.text();
				})
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
						const errorMessage = `Failed to load HTML: ${contentUri}`;
						console.warn(`Failed to preload ${contentUri} after ${MAX_RETRIES} attempts: ${error}`);
						addSimpleMessage('Content preload error: ' + errorMessage);
						// Don't reject - just log the failure and continue
						resolve();
					}
				});
			return;
		} else {
			// Assume image for everything else
			element = new Image();
		}

		const handleSuccess = () => {
			// Clean up event listeners
			element.onload = null;
			element.onerror = null;
			if ('onloadeddata' in element) {
				(element as HTMLVideoElement | HTMLAudioElement).onloadeddata = null;
			}
			resolve();
		};

		const handleError = (error: Event | string) => {
			// Clean up event listeners
			element.onload = null;
			element.onerror = null;
			if ('onloadeddata' in element) {
				(element as HTMLVideoElement | HTMLAudioElement).onloadeddata = null;
			}

			if (retryCount < MAX_RETRIES) {
				const retryDelay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 5000);
				console.log(`Retrying preload of ${contentUri} (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${retryDelay}ms`);

				setTimeout(() => {
					preloadFile(contentUri, addSimpleMessage, retryCount + 1).then(resolve).catch(reject);
				}, retryDelay);
			} else {
				const errorMessage = error instanceof Event ? `Failed to load media: ${contentUri}` : String(error);
				console.warn(`Failed to preload ${contentUri} after ${MAX_RETRIES} attempts: ${errorMessage}`);
				addSimpleMessage('Content preload error: ' + errorMessage);
				// Don't reject - just log the failure and continue
				resolve();
			}
		};

		// Set up event listeners
		if (isVideo || isAudio) {
			(element as HTMLVideoElement | HTMLAudioElement).onloadeddata = handleSuccess;
		} else {
			element.onload = handleSuccess;
		}
		element.onerror = handleError;

		// Start loading by setting src
		element.src = contentUri;
	});
}

/**
 * Preload round content (images, videos, audio, HTML files) with progress tracking
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

	appDispatch(mediaPreloaded());
}
