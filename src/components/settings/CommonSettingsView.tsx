import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import SettingsState from '../../state/settings/SettingsState';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import LanguageView from '../LanguageView';
import uiActionCreators from '../../state/ui/uiActionCreators';

interface CommonSettingsViewProps {
	settings: SettingsState;
	isSettingGameButtonKey: boolean;

	onSoundVolumeChange: (volume: number) => void;
	onSoundChange: (sound: boolean) => void;
	onMainMenuSoundChange: (sound: boolean) => void;
	onShowPersonsAtBottomOnWideScreenChanged: (showPersonsAtBottomOnWideScreen: boolean) => void;
	isSettingGameButtonKeyChanged: (isSettingGameButtonKey: boolean) => void;
}

const mapStateToProps = (state: State) => ({
	settings: state.settings,
	isSettingGameButtonKey: state.ui.isSettingGameButtonKey,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSoundVolumeChange: (volume: number) => {
		dispatch(settingsActionCreators.onSoundVolumeChanged(volume));
	},
	onSoundChange: (sound: boolean) => {
		dispatch(settingsActionCreators.onSoundChanged(sound));
	},
	onMainMenuSoundChange: (sound: boolean) => {
		dispatch(settingsActionCreators.onMainMenuSoundChanged(sound));
	},
	onShowPersonsAtBottomOnWideScreenChanged: (showPersonsAtBottomOnWideScreen: boolean) => {
		dispatch(settingsActionCreators.showPersonsAtBottomOnWideScreenChanged(showPersonsAtBottomOnWideScreen));
	},
	isSettingGameButtonKeyChanged: (isSettingGameButtonKey: boolean) => {
		dispatch(uiActionCreators.isSettingGameButtonKeyChanged(isSettingGameButtonKey));
	},
});


export function CommonSettingsView(props: CommonSettingsViewProps): JSX.Element {
	return (
		<div>
			<p className="header">{localization.language}</p>

			<LanguageView disabled={false} />

			<div className="settingItem">
				<input
					id="sound"
					type="checkbox"
					checked={props.settings.sound}
					onChange={() => props.onSoundChange(!props.settings.sound)}
				/>
				<label htmlFor="sound">{localization.sound}</label>
			</div>

			<div className="settingItem">
				<input
					id="mainMenusound"
					type="checkbox"
					checked={props.settings.mainMenuSound}
					onChange={() => props.onMainMenuSoundChange(!props.settings.mainMenuSound)}
				/>
				<label htmlFor="mainMenuSound">{localization.mainMenuSound}</label>
			</div>

			<p className="header">{localization.soundVolume}</p>

			<div className="settingItem">
				<input
					id="soundVolume"
					type="range"
					min={0}
					max={1}
					step={0.1}
					value={props.settings.soundVolume}
					onChange={(e) => props.onSoundVolumeChange(Number(e.target.value))}
				/>
			</div>

			<div className="settingItem">
				<input
					id="showPersonsAtBottomOnWideScreen"
					type="checkbox"
					checked={props.settings.showPersonsAtBottomOnWideScreen}
					onChange={() => props.onShowPersonsAtBottomOnWideScreenChanged(!props.settings.showPersonsAtBottomOnWideScreen)}
				/>
				
				<label htmlFor="showPersonsAtBottomOnWideScreen">{localization.showPersonsAtBottomOnWideScreen}</label>
			</div>

			<p className="header">{localization.gameButtonKey}</p>

			<button
				className={`gameButtonKey standard ${props.isSettingGameButtonKey ? 'active' : ''}`}
				title={localization.set}
				disabled={props.isSettingGameButtonKey}
				onClick={() => props.isSettingGameButtonKeyChanged(true)}
			>
				{props.settings.gameButtonKey ?? localization.notSet}
			</button>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonSettingsView);

