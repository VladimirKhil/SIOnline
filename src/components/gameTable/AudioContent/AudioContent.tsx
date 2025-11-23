import * as React from 'react';
import { useEffect, useRef } from 'react';
import getErrorMessage from '../../../utils/ErrorHelpers';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { onMediaEnded, onMediaLoaded } from '../../../state/serverActions';
import { addOperationErrorMessage } from '../../../state/room2Slice';

interface AudioContentProps {
	audioContext: AudioContext;
	autoPlayEnabled: boolean;
}

const AudioContent: React.FC<AudioContentProps> = ({
	audioContext,
	autoPlayEnabled,
}) => {
	const startTimeRef = useRef(0);
	const pauseTimeRef = useRef(0);
	const completedRef = useRef(false);
	const audioBufferRef = useRef<AudioBuffer | null>(null);
	const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);

	const appDispatch = useAppDispatch();

	const { isVisible, soundVolume, isMediaStopped, audio } = useAppSelector(state => ({
		isVisible: state.ui.isVisible,
		soundVolume: state.settings.soundVolume,
		isMediaStopped: state.room2.stage.isGamePaused || state.table.isMediaStopped,
		audio: state.table.audio || '',
	}));

	// Initialize gain node
	useEffect(() => {
		gainNodeRef.current = audioContext.createGain();
		gainNodeRef.current.connect(audioContext.destination);

		return () => {
			if (gainNodeRef.current) {
				gainNodeRef.current.disconnect();
			}
		};
	}, [audioContext]);

	// Update volume when soundVolume changes
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = soundVolume;
        }
    }, [soundVolume]);

	const operationError = (message: string) => {
		appDispatch(addOperationErrorMessage(message));
	};

	const onMediaCompleted = () => {
		console.log(`Audio playback completed: ${audio}`);
		appDispatch(onMediaEnded({ contentType: 'audio', contentValue: audio }));
	};

	const stop = () => {
		if (audioSourceRef.current && audioSourceRef.current.context.state === 'running') {
			pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
			audioSourceRef.current.onended = null;
			audioSourceRef.current.stop();
			audioSourceRef.current = null;
		}
	};

	const play = () => {
		if (!autoPlayEnabled || isMediaStopped || !isVisible ||
			(audioSourceRef.current && audioSourceRef.current.context.state === 'running')) {
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
	};

	const load = async () => {
		try {
			console.log(`Loading audio: ${audio}`);
			const response = await fetch(audio);

			if (!response.ok) {
				operationError(`${localization.audioLoadError} ${audio}: ${response.statusText}`);
				return;
			}

			const arrayBuffer = await response.arrayBuffer();
			audioBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);

			appDispatch(onMediaLoaded());

			pauseTimeRef.current = 0;
			play();
			completedRef.current = false;
		} catch (e) {
			operationError(getErrorMessage(e));
		}
	};

	// Load new audio when audio prop changes
	useEffect(() => {
		if (audio.length === 0) {
			return;
		}

		completedRef.current = true; // to avoid calling play in the next effect
		load();

		return () => stop();
	}, [audio]);

	// Handle playback control changes (only when audio stays the same)
	useEffect(() => {
		if (audio.length === 0 || !audioBufferRef.current) {
			return;
		}

		if (isMediaStopped || !isVisible) {
			stop();
		} else if (autoPlayEnabled && !completedRef.current) {
			play();
		}
	}, [isMediaStopped, isVisible, autoPlayEnabled]);

	return null;
};

export default AudioContent;
