import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';
import MuteButton from '../common/MuteButton';

interface TableVideoProps {
	isSoundEnabled: boolean;
	canTry: boolean;
	text: string;
	isMediaStopped: boolean;
	onMediaEnded: () => void;
}

const mapStateToProps = (state: State) => ({
	isSoundEnabled: state.settings.isSoundEnabled,
	canTry: state.run.table.canPress,
	text: state.run.table.text,
	isMediaStopped: state.run.stage.isGamePaused || state.run.table.isMediaStopped
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(runActionCreators.onMediaEnded() as object as Action);
	}
});

// tslint:disable-next-line: function-name
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
		const style: React.CSSProperties = {
			borderColor: this.props.canTry ? '#FFE682' : 'transparent'
		};

		return (
			<div className="tableBorder tableBorderCentered" style={style}>
				<video ref={this.videoRef} autoPlay muted={!this.props.isSoundEnabled} onEnded={e => this.props.onMediaEnded()}>
					<source src={this.props.text} />
				</video>
				<MuteButton />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableVideo);
