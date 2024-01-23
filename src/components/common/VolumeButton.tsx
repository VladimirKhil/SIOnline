import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import localization from '../../model/resources/localization';

import './VolumeButton.css';

interface VolumeButtonProps {
	canPlayAudio: boolean;
	isVolumeControlVisible: boolean;
	soundVolume: number;
	toggleVisibility: () => void;
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
	changeVolumeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onSoundVolumeChange(Number(e.target.value));
	};

	render() {
		return (
			<>
				<button
					type="button"
					onClick={this.props.toggleVisibility}
					className="volumeButton"
					style={{ background: this.props.isVolumeControlVisible ? 'lightgrey' : 'none' }}
					title={this.props.soundVolume ? localization.enableSound : localization.disableSound}
				>
					{this.props.soundVolume && this.props.canPlayAudio ? '🔈' : '🔇'}
				</button>

				<input
					aria-label='Volume range'
					min={0}
					max={1}
					step={0.1}
					type="range"
					value={this.props.soundVolume}
					onChange={this.changeVolumeHandler}
					style={{ display: this.props.isVolumeControlVisible ? 'block' : 'none' }}
					className="volumeButtonControl"
				/>
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(VolumeButton);
