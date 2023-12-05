import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import localization from '../../model/resources/localization';

import './VolumeButton.css';

const globalAudioContext = new AudioContext();

interface VolumeButtonProps {
	soundVolume: number;
	onEnableAudioPlay: () => void;
	onSoundVolumeChange: (volume: number) => void;
}

interface VolumeButtonState {
	isVolumeControlVisible: boolean;
	canPlayAudio: boolean;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSoundVolumeChange: (volume: number) => {
		dispatch(settingsActionCreators.onSoundVolumeChanged(volume));
	}
});

export class VolumeButton extends React.Component<VolumeButtonProps, VolumeButtonState> {
	audioContext: AudioContext;

	audioContextEventListener: () => void = () => {};

	constructor(props: VolumeButtonProps) {
		super(props);

		this.audioContext = globalAudioContext;

		this.state = {
			isVolumeControlVisible: false,
			canPlayAudio: this.audioContext.state === 'running'
		};
	}

	componentDidMount(): void {
		this.audioContextEventListener = () => {
			const canPlay = this.audioContext.state === 'running';

			this.setState({
				canPlayAudio: canPlay
			});

			if (canPlay) {
				this.audioContext.removeEventListener('statechange', this.audioContextEventListener);
			}
		};

		this.audioContext.addEventListener('statechange', this.audioContextEventListener);
		this.audioContext.resume().then(this.audioContextEventListener);
	}

	componentWillUnmount(): void {
		this.audioContext.removeEventListener('statechange', this.audioContextEventListener);
	}

	toggleVisibility = () => {
		if (!this.state.canPlayAudio) {
			this.audioContext.resume();
			this.audioContext.createGain();
			this.props.onEnableAudioPlay();
		} else {
			this.setState((state) => ({ ...state, isVolumeControlVisible: !this.state.isVolumeControlVisible }));
		}
	};

	changeVolumeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onSoundVolumeChange(Number(e.target.value));
	};

	render() {
		return (
			<>
				<button
					type="button"
					onClick={this.toggleVisibility}
					className="volumeButton"
					style={{ background: this.state.isVolumeControlVisible ? 'lightgrey' : 'none' }}
					title={this.props.soundVolume ? localization.enableSound : localization.disableSound}
				>
					{this.props.soundVolume && this.state.canPlayAudio ? '🔈' : '🔇'}
				</button>

				<input
					aria-label='Volume range'
					min={0}
					max={1}
					step={0.1}
					type="range"
					value={this.props.soundVolume}
					onChange={this.changeVolumeHandler}
					style={{ display: this.state.isVolumeControlVisible ? 'block' : 'none' }}
					className="volumeButtonControl"
				/>
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(VolumeButton);
