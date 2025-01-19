import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import Constants from '../../../model/enums/Constants';
import { isSettingGameButtonKeyChanged } from '../../../state/uiSlice';
import { setBindNextButton } from '../../../state/settingsSlice';

import './KeysSettingsView.scss';

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

const KeysSettingsView: React.FC = () => {
	const settings = useAppSelector(state => state.settings);
	const ui = useAppSelector(state => state.ui);
	const appDispatch = useAppDispatch();

	return (
		<div className='keys-settings-view'>
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
		</div>
	);
};

export default KeysSettingsView;