import * as React from 'react';
import localization from '../../../model/resources/localization';
import LanguageView from '../../panels/LanguageView/LanguageView';
import Constants from '../../../model/enums/Constants';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';

import { setAppSound,
	setAttachContentToTable,
	setBindNextButton,
	setFloatingControls,
	setMainMenuSound,
	setShowPersonsAtBottomOnWideScreen,
	setShowVideoAvatars,
	setSound,
	setSoundVolume } from '../../../state/new/settingsSlice';
import { isSettingGameButtonKeyChanged } from '../../../state/new/uiSlice';

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

export function CommonSettingsView(): JSX.Element {
	const settings = useAppSelector(state => state.settings);
	const ui = useAppSelector(state => state.ui);
	const appDispatch = useAppDispatch();

	return (
		<div>
			<p className="header">{localization.language}</p>

			<LanguageView disabled={false} />

			<div className="settingItem">
				<input
					id="sound"
					type="checkbox"
					checked={settings.sound}
					onChange={() => appDispatch(setSound(!settings.sound))}
				/>
				<label htmlFor="sound">{localization.sound}</label>
			</div>

			<div className="settingItem">
				<input
					id="appSound"
					type="checkbox"
					checked={settings.appSound}
					onChange={() => appDispatch(setAppSound(!settings.appSound))}
				/>
				<label htmlFor="appSound">{localization.soundApp}</label>
			</div>

			<div className="settingItem">
				<input
					id="mainMenuSound"
					type="checkbox"
					checked={settings.mainMenuSound}
					onChange={() => appDispatch(setMainMenuSound(!settings.mainMenuSound))}
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
					value={settings.soundVolume}
					onChange={(e) => appDispatch(setSoundVolume(Number(e.target.value)))}
				/>
			</div>

			<div className="settingItem">
				<input
					id="showPersonsAtBottomOnWideScreen"
					type="checkbox"
					checked={settings.showPersonsAtBottomOnWideScreen}
					onChange={() => appDispatch(setShowPersonsAtBottomOnWideScreen(!settings.showPersonsAtBottomOnWideScreen))}
				/>

				<label htmlFor="showPersonsAtBottomOnWideScreen">{localization.showPersonsAtBottomOnWideScreen}</label>
			</div>

			<div className="settingItem">
				<input
					id="floatingControls"
					type="checkbox"
					checked={settings.floatingControls}
					onChange={() => appDispatch(setFloatingControls(!settings.floatingControls))}
				/>

				<label htmlFor="floatingControls">{localization.floatingControls}</label>
			</div>

			<p className="header">{localization.gameButtonKey}</p>

			<button
				type='button'
				className={`gameButtonKey standard ${ui.isSettingGameButtonKey ? 'active' : ''}`}
				title={localization.set}
				disabled={ui.isSettingGameButtonKey}
				onClick={() => appDispatch(isSettingGameButtonKeyChanged(true))}
			>
				{getKeyName(settings.gameButtonKey ?? localization.notSet)}
			</button>

			<div className="settingItem">
				<input
					id="bindNextButton"
					type="checkbox"
					checked={settings.bindNextButton}
					onChange={() => appDispatch(setBindNextButton(!settings.bindNextButton))}
				/>

				<label htmlFor="bindNextButton">{localization.bindNextButton}</label>
			</div>

			<div className="settingItem">
				<input
					id="attachContentToTable"
					type="checkbox"
					checked={settings.attachContentToTable}
					onChange={() => appDispatch(setAttachContentToTable(!settings.attachContentToTable))}
				/>

				<label htmlFor="attachContentToTable">{localization.attachContentToTable}</label>
			</div>

			<div className="settingItem">
				<input
					id="showVideoAvatars"
					type="checkbox"
					checked={settings.showVideoAvatars}
					onChange={() => appDispatch(setShowVideoAvatars(!settings.showVideoAvatars))}
				/>

				<label htmlFor="showVideoAvatars">{localization.showVideoAvatars}</label>
			</div>
		</div>
	);
}

export default CommonSettingsView;

