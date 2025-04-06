import React from 'react';
import localization from '../../../model/resources/localization';
import Constants from '../../../model/enums/Constants';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { settingKeyChanged } from '../../../state/uiSlice';

import './KeySetting.scss';

interface KeySettingProps {
	buttonKey: string;
	label: string;
	value: string | null;
}

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

const KeySetting: React.FC<KeySettingProps> = ({ buttonKey, label, value }) => {
	const appDispatch = useAppDispatch();
	const ui = useAppSelector(state => state.ui);
	const isSettingKey = ui.settingKey === buttonKey;

	return (
		<div className="key-setting">
			<div className="key-setting-header">{label}</div>

			<button
				type='button'
				className={`key-setting-button standard ${isSettingKey ? 'active' : ''}`}
				title={localization.set}
				disabled={isSettingKey}
				onClick={() => { appDispatch(settingKeyChanged(buttonKey)); }}
			>
				{getKeyName(value ?? localization.notSet)}
			</button>
		</div>
	);
};

export default KeySetting;