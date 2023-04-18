import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import roomActionCreators from '../../state/room/roomActionCreators';
import VolumeButton from '../common/VolumeButton';
import TableBorder from './TableBorder';
import getErrorMessage from '../../utils/ErrorHelpers';
import localization from '../../model/resources/localization';
import getExtension from '../../utils/FileHelper';

interface TableVideoProps {
	soundVolume: number;
	text: string;
	isMediaStopped: boolean;

	mediaLoaded: () => void;
	onMediaEnded: () => void;
	operationError: (error: string) => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	text: state.table.text,
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
	}
});

export class TableVideo extends React.Component<TableVideoProps> {
	private videoRef: React.RefObject<HTMLVideoElement>;

	private playPromise: Promise<void> | null = null;

	constructor(props: TableVideoProps) {
		super(props);

		this.videoRef = React.createRef();
	}

	componentDidMount() {
		if (!this.videoRef.current || this.props.text.length === 0) {
			return;
		}

		this.videoRef.current.volume = this.props.soundVolume;

		const ext = getExtension(this.props.text);
		const canPlay = ext && this.videoRef.current.canPlayType('video/' + ext);

		if (canPlay === '') {
			this.props.operationError(`${localization.unsupportedMediaType}: ${ext}`);
		}
	}

	componentDidUpdate(prevProps: TableVideoProps) {
		const video = this.videoRef.current;

		if (!video) {
			return;
		}

		if (this.props.text !== video.currentSrc) {
			video.load();
		}

		if (this.props.isMediaStopped !== prevProps.isMediaStopped) {
			if (this.props.isMediaStopped) {
				if (this.playPromise) {
					this.playPromise.then(() => video.pause());
				} else {
					video.pause();
				}
			} else {
				this.playPromise = video.play().catch((e) => this.props.operationError(getErrorMessage(e)));
			}
		}

		video.volume = this.props.soundVolume;
	}

	play = () => {
		const video = this.videoRef.current;

		if (video) {
			this.playPromise = video.play().catch((e) => this.props.operationError(getErrorMessage(e)));
			video.muted = false;
		}
	};

	render() {
		const { onMediaEnded, text } = this.props;

		return (
			<TableBorder>
				<video ref={this.videoRef} autoPlay onEnded={onMediaEnded} onLoadedData={() => this.props.mediaLoaded()}>
					<source src={text} />
				</video>

				<VolumeButton onEnableAudioPlay={this.play} />
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableVideo);
