import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';
import VolumeButton from '../common/VolumeButton';
import settingsActionCreators from '../../state/settings/settingsActionCreators';

interface TableAudioProps {
	soundVolume: number;
	source: string;
	isMediaStopped: boolean;
	onMediaEnded: () => void;
	onSoundVolumeChange: (volume: number) => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume,
	isMediaStopped: state.run.stage.isGamePaused || state.run.table.isMediaStopped
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMediaEnded: () => {
		dispatch(runActionCreators.onMediaEnded() as object as Action);
	},
	onSoundVolumeChange: (volume: number) => {
		dispatch(settingsActionCreators.onSoundVolumeChanged(volume));
	}
});

export class TableAudio extends React.Component<TableAudioProps> {
	private audioRef: React.RefObject<HTMLAudioElement>;

	constructor(props: TableAudioProps) {
		super(props);

		this.audioRef = React.createRef();
	}

	componentDidMount() {
		if (!this.audioRef.current) {
			return;
		}

		this.audioRef.current.volume = this.props.soundVolume;
	}

	componentDidUpdate(prevProps: TableAudioProps) {
		const audio = this.audioRef.current;

		if (!audio) {
			return;
		}

		if (this.props.source !== audio.currentSrc) {
			audio.load();
		}

		if (this.props.isMediaStopped !== prevProps.isMediaStopped) {
			if (this.props.isMediaStopped) {
				audio.pause();
			} else {
				audio.play().catch(e => console.error(e));
			}
		}

		audio.volume = this.props.soundVolume;
	}

	render() {
		const { onMediaEnded, source } = this.props;

		return (
			<>
				<audio ref={this.audioRef} autoPlay onEnded={onMediaEnded}>
					<source src={source} />
				</audio>
				<VolumeButton />
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableAudio);
