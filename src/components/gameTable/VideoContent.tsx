import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import roomActionCreators from '../../state/room/roomActionCreators';
import getErrorMessage from '../../utils/ErrorHelpers';
import localization from '../../model/resources/localization';
import getExtension from '../../utils/FileHelper';

import './VideoContent.css';

interface VideoContentProps {
	soundVolume: number;
	uri: string;
	isMediaStopped: boolean;
	autoPlayEnabled: boolean;

	mediaLoaded: () => void;
	onMediaEnded: () => void;
	operationError: (error: string) => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
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

export class VideoContent extends React.Component<VideoContentProps> {
	private videoRef: React.RefObject<HTMLVideoElement>;

	private playPromise: Promise<void> | null = null;

	constructor(props: VideoContentProps) {
		super(props);

		this.videoRef = React.createRef();
	}

	componentDidMount() {
		if (!this.videoRef.current || this.props.uri.length === 0) {
			return;
		}

		this.videoRef.current.volume = this.props.soundVolume;

		const ext = getExtension(this.props.uri);
		const canPlay = ext && this.videoRef.current.canPlayType('video/' + ext);

		if (canPlay === '') {
			this.props.operationError(`${localization.unsupportedMediaType}: ${ext}`);
		}
	}

	componentDidUpdate(prevProps: VideoContentProps) {
		const video = this.videoRef.current;

		if (!video) {
			return;
		}

		if (this.props.uri !== video.currentSrc) {
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

		if (this.props.autoPlayEnabled !== prevProps.autoPlayEnabled) {
			this.play();
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
		const { onMediaEnded, uri } = this.props;

		return (
			<div className='video-host'>
				<video ref={this.videoRef} autoPlay onEnded={onMediaEnded} onLoadedData={() => this.props.mediaLoaded()}>
					<source src={uri} />
				</video>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoContent);
