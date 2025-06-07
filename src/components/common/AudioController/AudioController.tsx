import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import getErrorMessage from '../../../utils/ErrorHelpers';
import localization from '../../../model/resources/localization';
import { gameSoundPlayer } from '../../../utils/GameSoundPlayer';

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

export class AudioController extends React.Component<AudioControllerProps> {
	private audioContext = new AudioContext();

	private startTime = 0;

	private pauseTime = 0;

	private completed = false;

	private audioBuffer: AudioBuffer | null = null;

	private audioSource: AudioBufferSourceNode | null = null;

	private gainNode: GainNode;

	constructor(props: AudioControllerProps) {
		super(props);

		this.gainNode = this.audioContext.createGain();
		this.gainNode.connect(this.audioContext.destination);
		this.gainNode.gain.value = props.soundVolume;
	}

	async load(audio: string) {
		try {
			const response = await fetch(audio);

			if (!response.ok) {
				console.error(`${localization.audioLoadError} ${audio}: ${response.statusText}`);
				return;
			}

			const arrayBuffer = await response.arrayBuffer();
			this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

			this.pauseTime = 0;
			this.play();
			this.completed = false;
		} catch (e) {
			console.error(getErrorMessage(e));
		}
	}

	play() {
		if (!this.props.isVisible || !this.props.audio) {
			return;
		}

		this.stop();

		this.audioSource = this.audioContext.createBufferSource();
		this.audioSource.buffer = this.audioBuffer;
		this.audioSource.loop = this.props.loop;

		this.audioSource.onended = () => {
			if (this.props.isVisible) {
				this.completed = true;
			}
		};

		this.audioSource.connect(this.gainNode);
		this.startTime = this.audioContext.currentTime;
		this.audioSource.start(0, this.pauseTime);
	}

	stop() {
		if (this.audioSource) {
			if (this.audioSource.context.state === 'running') {
				this.pauseTime += this.audioContext.currentTime - this.startTime;
			}

			this.audioSource.onended = null;
			this.audioSource.stop();
			this.audioSource = null;
		}
	}

	componentDidMount() {
		if (!this.props.audio) {
			return;
		}

		this.load(this.props.audio);
	}

	componentDidUpdate(prevProps: AudioControllerProps) {
		if (this.props.audio !== prevProps.audio) {
			if (prevProps.audio) {
				this.stop();
			}

			if (!this.props.audio) {
				return;
			}

			this.load(this.props.audio);
		} else if (this.props.isVisible !== prevProps.isVisible) {
			if (!this.props.isVisible) {
				this.stop();
			} else if (!this.completed) {
				this.play();
			}
		}

		if (this.props.soundVolume !== prevProps.soundVolume) {
			this.gainNode.gain.value = this.props.soundVolume;
		}
	}

	componentWillUnmount(): void {
		this.stop();
	}

	// eslint-disable-next-line class-methods-use-this
	render(): null {
		return null;
	}
}

export default connect(mapStateToProps)(AudioController);
