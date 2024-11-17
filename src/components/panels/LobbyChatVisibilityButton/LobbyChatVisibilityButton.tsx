import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import { setLobbyChatVisibility } from '../../../state/new/settingsSlice';

import './LobbyChatVisibilityButton.css';

export default function LobbyChatVisibilityButton(): JSX.Element {
	const settings = useAppSelector(state => state.settings);
	const appDispatch = useAppDispatch();

	function onLobbyChatVisibilityChanged(): void {
		appDispatch(setLobbyChatVisibility(settings.isLobbyChatHidden));
	}

	return (
		<button
			className='lobbyChatVisibilityButton'
			title={settings.isLobbyChatHidden ? localization.showChat : localization.hideChat}
			onClick={onLobbyChatVisibilityChanged}
		>
			👁
		</button>
	);
}
