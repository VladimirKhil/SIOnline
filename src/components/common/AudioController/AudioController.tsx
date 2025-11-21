import * as React from 'react';
import { useEffect, useRef } from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import getErrorMessage from '../../../utils/ErrorHelpers';
import localization from '../../../model/resources/localization';
import { gameSoundPlayer } from '../../../utils/GameSoundPlayer';
import { useAudioContext } from '../../../contexts/AudioContextProvider';

interface AudioControllerProps {
	soundVolume: number;
	audio: string | null;
	loop: boolean;
	isVisible: boolean;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	audio: state.common.audio ? gameSoundPlayer.getSound(state.common.audio) ?? null : null,
	loop: state.common.audioLoop,
	isVisible: state.ui.isVisible,
});

const AudioControllerComponent: React.FC<AudioControllerProps> = (props) => {
	const { audioContext } = useAudioContext();

	const startTimeRef = useRef(0);
	const pauseTimeRef = useRef(0);
	const completedRef = useRef(false);
	const audioBufferRef = useRef<AudioBuffer | null>(null);
	const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);

	// Initialize gain node
	useEffect(() => {
		gainNodeRef.current = audioContext.createGain();
		gainNodeRef.current.connect(audioContext.destination);
		gainNodeRef.current.gain.value = props.soundVolume;

		return () => {
			if (gainNodeRef.current) {
				gainNodeRef.current.disconnect();
			}
		};
	}, [audioContext, props.soundVolume]);

	// Update volume when soundVolume changes
	useEffect(() => {
		if (gainNodeRef.current) {
			gainNodeRef.current.gain.value = props.soundVolume;
		}
	}, [props.soundVolume]);

	// Stop audio source
	const stop = () => {
		if (audioSourceRef.current) {
			if (audioSourceRef.current.context.state === 'running') {
				pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
			}

			audioSourceRef.current.onended = null;
			audioSourceRef.current.stop();
			audioSourceRef.current = null;
		}
	};

	// Play audio
	const play = () => {
		if (!props.isVisible || !props.audio) {
			return;
		}

		stop();

		audioSourceRef.current = audioContext.createBufferSource();
		audioSourceRef.current.buffer = audioBufferRef.current;
		audioSourceRef.current.loop = props.loop;

		audioSourceRef.current.onended = () => {
			if (props.isVisible) {
				completedRef.current = true;
			}
		};

		if (gainNodeRef.current) {
			audioSourceRef.current.connect(gainNodeRef.current);
		}

		startTimeRef.current = audioContext.currentTime;
		audioSourceRef.current.start(0, pauseTimeRef.current);
	};

	// Load audio
	useEffect(() => {
		const load = async (audio: string) => {
			try {
				const response = await fetch(audio);

				if (!response.ok) {
					console.error(`${localization.audioLoadError} ${audio}: ${response.statusText}`);
					return;
				}

				const arrayBuffer = await response.arrayBuffer();
				audioBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);

				pauseTimeRef.current = 0;
				completedRef.current = false;
				play();
			} catch (e) {
				console.error(getErrorMessage(e));
			}
		};

		if (props.audio) {
			load(props.audio);
		} else {
			stop();
		}

		return () => {
			stop();
		};
	}, [props.audio, audioContext]);

	// Handle visibility changes
	useEffect(() => {
		if (!props.isVisible) {
			stop();
		} else if (!completedRef.current && audioBufferRef.current) {
			play();
		}
	}, [props.isVisible]);

	return null;
};

export default connect(mapStateToProps)(AudioControllerComponent);
