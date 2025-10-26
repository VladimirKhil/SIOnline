import * as React from 'react';
import { useEffect, useRef } from 'react';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import roomActionCreators from '../../../state/room/roomActionCreators';
import getErrorMessage from '../../../utils/ErrorHelpers';
import localization from '../../../model/resources/localization';
import { useAppDispatch } from '../../../state/hooks';
import { onMediaEnded } from '../../../state/serverActions';
import { addOperationErrorMessage } from '../../../state/room2Slice';

interface AudioContentProps {
	audioContext: AudioContext;
	autoPlayEnabled: boolean;
	soundVolume: number;
	audio: string;
	isMediaStopped: boolean;
	isVisible: boolean;

	mediaLoaded: () => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	audio: state.table.audio,
	isMediaStopped: state.room2.stage.isGamePaused || state.table.isMediaStopped,
	isVisible: state.ui.isVisible,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	mediaLoaded: () => {
		dispatch(roomActionCreators.mediaLoaded() as unknown as Action);
	},
});

export const AudioContent: React.FC<AudioContentProps> = ({
	audioContext,
	autoPlayEnabled,
	soundVolume,
	audio,
	isMediaStopped,
	isVisible,
	mediaLoaded
}) => {
	const startTimeRef = useRef(0);
	const pauseTimeRef = useRef(0);
	const completedRef = useRef(false);
	const audioBufferRef = useRef<AudioBuffer | null>(null);
	const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);

	// Track previous values to match componentDidUpdate behavior
	const prevPropsRef = useRef({
		audio: '',
		soundVolume: 0,
		isMediaStopped: false,
		isVisible: true,
		autoPlayEnabled: false
	});

	const appDispatch = useAppDispatch();

	// Initialize gain node
	useEffect(() => {
		gainNodeRef.current = audioContext.createGain();
		gainNodeRef.current.connect(audioContext.destination);
		gainNodeRef.current.gain.value = soundVolume;

		return () => {
			if (gainNodeRef.current) {
				gainNodeRef.current.disconnect();
			}
		};
	}, [audioContext]);

	const operationError = (message: string) => {
		appDispatch(addOperationErrorMessage(message));
	};

	const onMediaCompleted = React.useCallback(() => {
		appDispatch(onMediaEnded({ contentType: 'audio', contentValue: audio }));
	}, [audio, appDispatch]);

	const stop = React.useCallback(() => {
		if (audioSourceRef.current && audioSourceRef.current.context.state === 'running') {
			pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
			audioSourceRef.current.onended = null;
			audioSourceRef.current.stop();
			audioSourceRef.current = null;
		}
	}, [audioContext]);

	const play = React.useCallback(() => {
		if (!autoPlayEnabled || isMediaStopped || !isVisible) {
			return;
		}

		audioSourceRef.current = audioContext.createBufferSource();
		audioSourceRef.current.buffer = audioBufferRef.current;
		audioSourceRef.current.loop = false;

		audioSourceRef.current.onended = () => {
			if (!isMediaStopped && isVisible) {
				completedRef.current = true;
				onMediaCompleted();
			}
		};

		if (gainNodeRef.current) {
			audioSourceRef.current.connect(gainNodeRef.current);
		}
		startTimeRef.current = audioContext.currentTime;
		audioSourceRef.current.start(0, pauseTimeRef.current);
	}, [autoPlayEnabled, isMediaStopped, isVisible, audioContext]);

	const load = React.useCallback(async () => {
		try {
			const response = await fetch(audio);

			if (!response.ok) {
				operationError(`${localization.audioLoadError} ${audio}: ${response.statusText}`);
				return;
			}

			const arrayBuffer = await response.arrayBuffer();
			audioBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);

			mediaLoaded();

			pauseTimeRef.current = 0;
			play();
			completedRef.current = false;
		} catch (e) {
			operationError(getErrorMessage(e));
		}
	}, [audio, audioContext]);

	// ComponentDidMount equivalent
	useEffect(() => {
		if (audio.length === 0) {
			return;
		}

		load();

		// Initialize previous props
		prevPropsRef.current = {
			audio,
			soundVolume,
			isMediaStopped,
			isVisible,
			autoPlayEnabled
		};

		return () => stop();
	}, []);

	// Single ComponentDidUpdate equivalent
	useEffect(() => {
		const prevProps = prevPropsRef.current;

		try {
			if (audio === '') {
				if (prevProps.audio !== '') {
					stop();
				}

				return;
			}

			// Update gain volume if changed
			if (soundVolume !== prevProps.soundVolume && gainNodeRef.current) {
				gainNodeRef.current.gain.value = soundVolume;
			}

			// Handle audio change
			if (audio !== prevProps.audio) {
				stop();
				load();
			} else {
				// Handle other prop changes only if audio hasn't changed
				if (autoPlayEnabled !== prevProps.autoPlayEnabled && autoPlayEnabled) {
					play();
				} else if (isMediaStopped !== prevProps.isMediaStopped || isVisible !== prevProps.isVisible) {
					if (isMediaStopped || !isVisible) {
						stop();
					} else if (!completedRef.current) {
						play();
					}
				}
			}
		} finally {
			// Update previous props for next render
			prevPropsRef.current = {
				audio,
				soundVolume,
				isMediaStopped,
				isVisible,
				autoPlayEnabled
			};
		}
	}, [audio, soundVolume, isMediaStopped, isVisible, autoPlayEnabled]);

	return null;
};

export default connect(mapStateToProps, mapDispatchToProps)(AudioContent);
