import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import roomActionCreators from '../../state/room/roomActionCreators';
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
	audio: state.table.audio,
	isMediaStopped: state.room.stage.isGamePaused || state.table.isMediaStopped,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(roomActionCreators.onMediaEnded() as object as Action);
	},
	onSoundVolumeChange: (volume: number) => {
		dispatch(settingsActionCreators.onSoundVolumeChanged(volume));
	},
	operationError: (error: string) => {
		dispatch(roomActionCreators.operationError(error) as object as Action);
	},
	mediaLoaded: () => {
		dispatch(roomActionCreators.mediaLoaded() as unknown as Action);
	},
});

export class TableAudio extends React.Component<TableAudioProps> {
	private audioRef: HTMLAudioElement = AUDIO_OBJECT;

	componentDidMount() {
		if (this.props.audio.length === 0) {
			return;
		}

		this.audioRef.volume = this.props.soundVolume;
		this.audioRef.loop = false;
		const audio = this.audioRef;

		const ext = getExtension(this.props.audio);
		const canPlay = ext && this.audioRef.canPlayType('audio/' + ext);

		if (canPlay === '') {
			this.props.operationError(`${localization.unsupportedMediaType}: ${ext}`);
		} else {
			audio.onload = () => {
				this.props.mediaLoaded();
			};

			audio.onended = () => {
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
