import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';
import MuteButton from '../common/MuteButton';
import TableBorder from './TableBorder';

interface TableVideoProps {
	isSoundEnabled: boolean;
	text: string;
	isMediaStopped: boolean;
	onMediaEnded: () => void;
}

const mapStateToProps = (state: State) => ({
	isSoundEnabled: state.settings.isSoundEnabled,
	text: state.run.table.text,
	isMediaStopped: state.run.stage.isGamePaused || state.run.table.isMediaStopped
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(runActionCreators.onMediaEnded() as object as Action);
	}
});

export class TableVideo extends React.Component<TableVideoProps> {
	private videoRef: React.RefObject<HTMLVideoElement>;

	constructor(props: TableVideoProps) {
		super(props);

		this.videoRef = React.createRef();
	}

	componentDidUpdate(prevProps: TableVideoProps) {
		if (this.props.isMediaStopped !== prevProps.isMediaStopped && this.videoRef.current) {
			if (this.props.isMediaStopped) {
				this.videoRef.current.pause();
			} else {
				this.videoRef.current.play();
			}
		}
	}

	render() {
		return (
			<TableBorder>
				<video ref={this.videoRef} autoPlay muted={!this.props.isSoundEnabled} onEnded={e => this.props.onMediaEnded()}>
					<source src={this.props.text} />
				</video>
				<MuteButton />
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableVideo);
