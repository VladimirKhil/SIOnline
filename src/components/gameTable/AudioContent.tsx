import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import roomActionCreators from '../../state/room/roomActionCreators';
import getErrorMessage from '../../utils/ErrorHelpers';

interface AudioContentProps {
	audioContext: AudioContext;
	autoPlayEnabled: boolean;
	soundVolume: number;
	audio: string;
	isMediaStopped: boolean;

	mediaLoaded: () => void;
	onMediaEnded: () => void;
	operationError: (error: string) => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	audio: state.table.audio,
	isMediaStopped: state.room.stage.isGamePaused || state.table.isMediaStopped,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(roomActionCreators.onMediaEnded() as object as Action);
	},
	operationError: (error: string) => {
		dispatch(roomActionCreators.operationError(error) as object as Action);
	},
	mediaLoaded: () => {
		dispatch(roomActionCreators.mediaLoaded() as unknown as Action);
	},
});

export class AudioContent extends React.Component<AudioContentProps> {
	private startTime = 0;

	private playTime: number | null = null;

	private completed = false;

	private audioBuffer: AudioBuffer | null = null;

	private audioSource: AudioBufferSourceNode | null = null;

	private gainNode: GainNode;

	constructor(props: AudioContentProps) {
		super(props);

		const { audioContext } = props;

		this.gainNode = audioContext.createGain();
		this.gainNode.connect(audioContext.destination);
		this.gainNode.gain.value = props.soundVolume;
	}

	async load() {
		const { audioContext } = this.props;

		try {
			const response = await fetch(this.props.audio);
			const arrayBuffer = await response.arrayBuffer();
			this.audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			this.props.mediaLoaded();

			this.play();
			this.completed = false;
		} catch (e) {
			this.props.operationError(getErrorMessage(e));
		}
	}

	play(offset = 0) {
		this.audioSource = this.props.audioContext.createBufferSource();
		this.audioSource.buffer = this.audioBuffer;
		this.audioSource.loop = false;

		this.audioSource.onended = () => {
			if (!this.props.isMediaStopped) {
				this.completed = true;
				this.props.onMediaEnded();
			}
		};

		this.audioSource.connect(this.gainNode);
		this.audioSource.start(0, offset);
		this.startTime = this.props.audioContext.currentTime;
	}

	stop() {
		if (this.audioSource && this.audioSource.context.state === 'running') {
			this.playTime = this.props.audioContext.currentTime - this.startTime;
			this.audioSource.onended = null;
			this.audioSource.stop();
		}
	}

	componentDidMount() {
		if (this.props.audio.length === 0) {
			return;
		}

		this.load();
	}

	componentDidUpdate(prevProps: AudioContentProps) {
		if (this.props.audio == '') {
			return;
		}

		if (this.props.soundVolume !== prevProps.soundVolume) {
			this.gainNode.gain.value = this.props.soundVolume;
		}

		if (this.props.audio !== prevProps.audio) {
			this.stop();
			this.load();
		} else if (this.props.autoPlayEnabled !== prevProps.autoPlayEnabled && this.props.autoPlayEnabled) {
			this.play();
		} else if (this.props.isMediaStopped !== prevProps.isMediaStopped) {
			if (this.props.isMediaStopped) {
				this.stop();
			} else if (!this.completed) {
				this.play(this.playTime ?? 0);
			}
		}
	}

	componentWillUnmount(): void {
		this.stop();
	}

	render(): null {
		return null;
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AudioContent);
