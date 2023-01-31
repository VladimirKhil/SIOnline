import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';
import VolumeButton from '../common/VolumeButton';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import getErrorMessage from '../../utils/ErrorHelpers';
import getExtension from '../../utils/FileHelper';
import localization from '../../model/resources/localization';

const EMPTY_WAV_SOUND =
	'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
export const AUDIO_OBJECT = new Audio(EMPTY_WAV_SOUND);

interface TableAudioProps {
	soundVolume: number;
	audio: string;
	isMediaStopped: boolean;

	mediaLoaded: () => void;
	onMediaEnded: () => void;
	onSoundVolumeChange: (volume: number) => void;
	operationError: (error: string) => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	audio: state.run.table.audio.replace('https://vladimirkhil.com/siserver/3', 'http://192.168.100.3:5005'),
	isMediaStopped: state.run.stage.isGamePaused || state.run.table.isMediaStopped
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(runActionCreators.onMediaEnded() as object as Action);
	},
	onSoundVolumeChange: (volume: number) => {
		dispatch(settingsActionCreators.onSoundVolumeChanged(volume));
	},
	operationError: (error: string) => {
		dispatch(runActionCreators.operationError(error) as object as Action);
	},
	mediaLoaded: () => {
		dispatch(runActionCreators.mediaLoaded() as unknown as Action);
	}
});

export class TableAudio extends React.Component<TableAudioProps> {
	private audioRef: HTMLAudioElement = AUDIO_OBJECT;

	componentDidMount() {
		console.log(this.audioRef);
		this.audioRef.volume = this.props.soundVolume;
		this.audioRef.loop = false;
		const audio = this.audioRef;

		const ext = getExtension(this.props.audio);
		const canPlay = ext !== null && this.audioRef.canPlayType('audio/' + ext);

		if (canPlay === '') {
			this.props.operationError(`${localization.unsupportedMediaType}: ${ext}`);
		} else {
			audio.onload = () => {
				console.log('load');
				this.props.mediaLoaded();
			};
			audio.onended = () => {
				console.log('endaudio');
				this.props.onMediaEnded();
			};
			audio.src = this.props.audio;
			audio.load();
			audio.play().catch((e) => this.props.operationError(getErrorMessage(e)));
			if (audio.readyState >= 3) {
				this.props.mediaLoaded();
			}
		}
	}

	componentDidUpdate(prevProps: TableAudioProps) {
		const audio = this.audioRef;

		if (this.props.audio !== audio.currentSrc) {
			console.log(this.props.audio);
			audio.src = this.props.audio;
			audio.load();
		}

		if (this.props.isMediaStopped !== prevProps.isMediaStopped) {
			if (this.props.isMediaStopped) {
				audio.pause();
			} else {
				audio.play().catch((e) => this.props.operationError(getErrorMessage(e)));
			}
		}

		audio.volume = this.props.soundVolume;
	}

	onEnableAudioPlay = () => {
		this.audioRef.play();
	};

	render() {
		const { audio } = this.props;

		return audio.length === 0 ? null : (
			<>
				<VolumeButton onEnableAudioPlay={this.onEnableAudioPlay} />
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableAudio);
