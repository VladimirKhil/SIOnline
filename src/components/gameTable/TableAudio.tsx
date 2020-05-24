import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';
import MuteButton from '../common/MuteButton';

interface TableAudioProps {
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
export class TableAudio extends React.Component<TableAudioProps> {
	private audioRef: React.RefObject<HTMLAudioElement>;

	constructor(props: TableAudioProps) {
		super(props);

		this.audioRef = React.createRef();
	}

	componentDidUpdate(prevProps: TableAudioProps) {
		if (this.props.isMediaStopped !== prevProps.isMediaStopped && this.audioRef.current) {
			if (this.props.isMediaStopped) {
				this.audioRef.current.pause();
			} else {
				this.audioRef.current.play();
			}
		}
	}

	render() {
		const style: React.CSSProperties = {
			borderColor: this.props.canTry ? '#FFE682' : 'transparent'
		};

		return (
			<div className="tableBorder tableBorderCentered" style={style}>
				<audio ref={this.audioRef} autoPlay muted={!this.props.isSoundEnabled} onEnded={e => this.props.onMediaEnded()}>
					<source src={this.props.text} />
				</audio>
				<div className="centerBlock">
					<span className="clef rotate">&amp;</span>
				</div>
				<MuteButton />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableAudio);
