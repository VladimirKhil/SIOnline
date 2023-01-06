import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';
import VolumeButton from '../common/VolumeButton';
import TableBorder from './TableBorder';
import getErrorMessage from '../../utils/ErrorHelpers';
import localization from '../../model/resources/localization';
import getExtension from '../../utils/FileHelper';

interface TableVideoProps {
	soundVolume: number;
	text: string;
	isMediaStopped: boolean;
	onMediaEnded: () => void;
	operationError: (error: string) => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	text: state.run.table.text,
	isMediaStopped: state.run.stage.isGamePaused || state.run.table.isMediaStopped
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(runActionCreators.onMediaEnded() as object as Action);
	},
	operationError: (error: string) => {
		dispatch(runActionCreators.operationError(error) as object as Action);
	},
});

export class TableVideo extends React.Component<TableVideoProps> {
	private videoRef: React.RefObject<HTMLVideoElement>;

	constructor(props: TableVideoProps) {
		super(props);

		this.videoRef = React.createRef();
	}

	componentDidMount() {
		if (!this.videoRef.current) {
			return;
		}

		this.videoRef.current.volume = this.props.soundVolume;
		
		const ext = getExtension(this.props.text);
		const canPlay = ext !== null && this.videoRef.current.canPlayType(ext);

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
				video.pause();
			} else {
				video.play().catch(e => this.props.operationError(getErrorMessage(e)));
			}
		}

		video.volume = this.props.soundVolume;
	}

	render() {
		const { onMediaEnded, text } = this.props;

		return (
			<TableBorder>
				<video ref={this.videoRef} autoPlay onEnded={onMediaEnded}>
					<source src={text} />
				</video>
				<VolumeButton />
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableVideo);
