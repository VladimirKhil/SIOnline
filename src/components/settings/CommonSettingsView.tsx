import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import SettingsState from '../../state/settings/SettingsState';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import LanguageView from '../LanguageView';
import uiActionCreators from '../../state/ui/uiActionCreators';
import Constants from '../../model/enums/Constants';

interface CommonSettingsViewProps {
	settings: SettingsState;
	isSettingGameButtonKey: boolean;

	onSoundVolumeChange: (volume: number) => void;
	onSoundChange: (sound: boolean) => void;
	onAppSoundChange: (sound: boolean) => void;
	onMainMenuSoundChange: (sound: boolean) => void;
	onShowPersonsAtBottomOnWideScreenChanged: (showPersonsAtBottomOnWideScreen: boolean) => void;
	onFloatingControlsChanged: (float: boolean) => void;
	isSettingGameButtonKeyChanged: (isSettingGameButtonKey: boolean) => void;
	onBindNextButtonChanged: (bindNextButton: boolean) => void;
	onAttachContentToTableChanged: (attachContentToTable: boolean) => void;
	onShowVideoAvatarsChanged: (showVideoAvatars: boolean) => void;
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
	onAppSoundChange: (sound: boolean) => {
		dispatch(settingsActionCreators.onAppSoundChanged(sound));
	},
	onMainMenuSoundChange: (sound: boolean) => {
		dispatch(settingsActionCreators.onMainMenuSoundChanged(sound));
	},
	onShowPersonsAtBottomOnWideScreenChanged: (showPersonsAtBottomOnWideScreen: boolean) => {
		dispatch(settingsActionCreators.showPersonsAtBottomOnWideScreenChanged(showPersonsAtBottomOnWideScreen));
	},
	onFloatingControlsChanged: (float: boolean) => {
		dispatch(settingsActionCreators.onFloatingControlsChanged(float));
	},
	isSettingGameButtonKeyChanged: (isSettingGameButtonKey: boolean) => {
		dispatch(uiActionCreators.isSettingGameButtonKeyChanged(isSettingGameButtonKey));
	},
	onBindNextButtonChanged: (bindNextButton: boolean) => {
		dispatch(settingsActionCreators.onBindNextButtonChanged(bindNextButton));
	},
	onAttachContentToTableChanged: (attachContentToTable: boolean) => {
		dispatch(settingsActionCreators.onAttachContentToTableChanged(attachContentToTable));
	},
	onShowVideoAvatarsChanged: (showVideoAvatars: boolean) => {
		dispatch(settingsActionCreators.showVideoAvatarsChanged(showVideoAvatars));
	},
});

function getKeyName(key: string) {
	switch (key) {
		case Constants.KEY_CTRL:
			return 'Ctrl';

		case Constants.KEY_SPACE:
			return localization.keySpace;

		case Constants.KEY_RIGHT:
			return localization.keyRight;

		default:
			return key;
	}
}

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
					id="appSound"
					type="checkbox"
					checked={props.settings.appSound}
					onChange={() => props.onAppSoundChange(!props.settings.appSound)}
				/>
				<label htmlFor="appSound">{localization.soundApp}</label>
			</div>

			<div className="settingItem">
				<input
					id="mainMenuSound"
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
					aria-label={localization.soundVolume}
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

			<div className="settingItem">
				<input
					id="floatingControls"
					type="checkbox"
					checked={props.settings.floatingControls}
					onChange={() => props.onFloatingControlsChanged(!props.settings.floatingControls)}
				/>

				<label htmlFor="floatingControls">{localization.floatingControls}</label>
			</div>

			<p className="header">{localization.gameButtonKey}</p>

			<button
				type='button'
				className={`gameButtonKey standard ${props.isSettingGameButtonKey ? 'active' : ''}`}
				title={localization.set}
				disabled={props.isSettingGameButtonKey}
				onClick={() => props.isSettingGameButtonKeyChanged(true)}
			>
				{getKeyName(props.settings.gameButtonKey ?? localization.notSet)}
			</button>

			<div className="settingItem">
				<input
					id="bindNextButton"
					type="checkbox"
					checked={props.settings.bindNextButton}
					onChange={() => props.onBindNextButtonChanged(!props.settings.bindNextButton)}
				/>

				<label htmlFor="bindNextButton">{localization.bindNextButton}</label>
			</div>

			<div className="settingItem">
				<input
					id="attachContentToTable"
					type="checkbox"
					checked={props.settings.attachContentToTable}
					onChange={() => props.onAttachContentToTableChanged(!props.settings.attachContentToTable)}
				/>

				<label htmlFor="attachContentToTable">{localization.attachContentToTable}</label>
			</div>

			<div className="settingItem">
				<input
					id="showVideoAvatars"
					type="checkbox"
					checked={props.settings.showVideoAvatars}
					onChange={() => props.onShowVideoAvatarsChanged(!props.settings.showVideoAvatars)}
				/>

				<label htmlFor="showVideoAvatars">{localization.showVideoAvatars}</label>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonSettingsView);

