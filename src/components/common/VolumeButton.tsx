import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import localization from '../../model/resources/localization';

import './VolumeButton.css';

interface VolumeButtonProps {
	soundVolume: number;
	onSoundVolumeChange: (volume: number) => void;
}

const mapStateToProps = (state: State) => ({
	soundVolume: state.settings.soundVolume
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSoundVolumeChange: (volume: number) => {
		dispatch(settingsActionCreators.onSoundVolumeChanged(volume));
	}
});

export class VolumeButton extends React.Component<VolumeButtonProps> {
	state = { isVolumeControlVisible: false };

	toggleVisibility = () => {
		this.setState((state) => ({ ...state, isVolumeControlVisible: !this.state.isVolumeControlVisible }));
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
					{this.props.soundVolume ? '🔈' : '🔇'}
				</button>
				<input
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
