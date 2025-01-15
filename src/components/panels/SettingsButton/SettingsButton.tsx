import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch } from '../../../state/hooks';
import { showSettings } from '../../../state/uiSlice';

import './SettingsButton.css';

export function SettingsButton(): JSX.Element {
	const appDispatch = useAppDispatch();

	return (
		<button
			type='button'
			className="settingsButton"
			title={localization.settings}
			onClick={() => appDispatch(showSettings(true))}
		>
			<span>⚙</span>
		</button>
	);
}

export default SettingsButton;
