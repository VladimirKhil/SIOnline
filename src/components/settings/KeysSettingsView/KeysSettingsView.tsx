import * as React from 'react';
import { useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import KeySetting from '../KeySetting/KeySetting';

import './KeysSettingsView.scss';

const KeysSettingsView: React.FC = () => {
	const settings = useAppSelector(state => state.settings);

	return (
		<div className='keys-settings-view'>
			<div className='header'>{localization.showman}</div>
			<KeySetting buttonKey='next' label={localization.next} value={settings.nextButtonKey} />
			<KeySetting buttonKey='yes' label={localization.yes} value={settings.yesButtonKey} />
			<KeySetting buttonKey='no' label={localization.no} value={settings.noButtonKey} />
			<div className='header'>{localization.player}</div>
			<KeySetting buttonKey='answer' label={localization.makeAnswer} value={settings.gameButtonKey} />
			<KeySetting buttonKey='pass' label={localization.pass} value={settings.passButtonKey} />
		</div>
	);
};

export default KeysSettingsView;