import * as React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import getErrorMessage from '../../../utils/ErrorHelpers';
import localization from '../../../model/resources/localization';
import getExtension from '../../../utils/FileHelper';
import { useAppDispatch } from '../../../state/hooks';
import { onMediaEnded, onMediaLoaded } from '../../../state/serverActions';
import { addOperationErrorMessage } from '../../../state/room2Slice';
import { mediaTimeLeftChanged } from '../../../state/uiSlice';
import MediaTimer from '../MediaTimer/MediaTimer';

import './VideoContent.css';

interface VideoContentProps {
	soundVolume: number;
	uri: string;
	isMediaStopped: boolean;
	autoPlayEnabled: boolean;
	isVisible: boolean;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	isMediaStopped: state.room2.stage.isGamePaused || state.table.isMediaStopped,
	isVisible: state.ui.isVisible,
});

export const VideoContent: React.FC<VideoContentProps> = ({
	soundVolume,
	uri,
	isMediaStopped,
	autoPlayEnabled,
	isVisible,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const playPromiseRef = useRef<Promise<void> | null>(null);
	const completedRef = useRef(false);

	// Track previous values to match componentDidUpdate behavior
	const prevPropsRef = useRef({
		uri: '',
		soundVolume: 0,
		isMediaStopped: false,
		isVisible: true,
		autoPlayEnabled: false
	});

	const appDispatch = useAppDispatch();

	const operationError = useCallback((message: string) => {
		appDispatch(addOperationErrorMessage(message));
	}, [appDispatch]);

	const onMediaCompleted = useCallback(() => {
		appDispatch(onMediaEnded({ contentType: 'video', contentValue: uri }));
	}, [appDispatch, uri]);

	const play = useCallback(() => {
		const video = videoRef.current;

		if (video) {
			playPromiseRef.current = video.play().catch((e) => operationError(getErrorMessage(e)));
			video.muted = false;
		}
	}, [operationError]);

	// ComponentDidMount equivalent
	useEffect(() => {
		if (!videoRef.current || uri.length === 0) {
			return;
		}

		videoRef.current.volume = soundVolume;

		const ext = getExtension(uri);
		const canPlay = ext && videoRef.current.canPlayType('video/' + ext);

		if (canPlay === '') {
			operationError(`${localization.unsupportedMediaType}: ${ext}`);
		}

		// Initialize previous props
		prevPropsRef.current = {
			uri,
			soundVolume,
			isMediaStopped,
			isVisible,
			autoPlayEnabled
		};

		return () => {
			appDispatch(mediaTimeLeftChanged(0));

			if (videoRef.current) {
				videoRef.current.src = '';
				videoRef.current.load();
			}
		};
	}, []);

	// Single ComponentDidUpdate equivalent
	useEffect(() => {
		const video = videoRef.current;
		const prevProps = prevPropsRef.current;

		if (!video) {
			return;
		}

		// Handle URI changes
		if (uri !== prevProps.uri) {
			if (uri !== video.currentSrc) {
				video.load();
			}
		}

		// Handle media stopped and visibility changes
		if (isMediaStopped !== prevProps.isMediaStopped || isVisible !== prevProps.isVisible) {
			if (isMediaStopped || !isVisible) {
				if (playPromiseRef.current) {
					playPromiseRef.current.then(() => video.pause());
				} else {
					video.pause();
				}
			} else if (!completedRef.current) {
				playPromiseRef.current = video.play().catch((e) => operationError(getErrorMessage(e)));
			}
		}

		// Handle autoplay changes
		if (autoPlayEnabled !== prevProps.autoPlayEnabled) {
			play();
		}

		// Handle volume changes
		if (soundVolume !== prevProps.soundVolume) {
			video.volume = soundVolume;
		}

		// Update previous props for next render
		prevPropsRef.current = {
			uri,
			soundVolume,
			isMediaStopped,
			isVisible,
			autoPlayEnabled
		};
	}, [uri, soundVolume, isMediaStopped, isVisible, autoPlayEnabled, operationError, play]);

	// Report the time left to the countdown shown to the showman
	const onTimeUpdate = useCallback(() => {
		const video = videoRef.current;

		if (video && Number.isFinite(video.duration)) {
			appDispatch(mediaTimeLeftChanged(Math.max(0, Math.ceil(video.duration - video.currentTime))));
		}
	}, [appDispatch]);

	const onVideoEnded = useCallback(() => {
		if (!isMediaStopped && isVisible) {
			completedRef.current = true;
			onMediaCompleted();
		}
	}, [isMediaStopped, isVisible, onMediaCompleted]);

	return (
		<div className='video-host'>
			<video
				ref={videoRef}
				autoPlay={!isMediaStopped && isVisible}
				onEnded={onVideoEnded}
				onTimeUpdate={onTimeUpdate}
				crossOrigin="anonymous"
				onLoadedData={() => appDispatch(onMediaLoaded())}>
				<source src={uri} />
			</video>

			<MediaTimer />
		</div>
	);
};

export default connect(mapStateToProps)(VideoContent);
