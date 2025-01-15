import React from 'react';
import NewGameButton from '../NewGameButton/NewGameButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import OnlineMode from '../../../model/enums/OnlineMode';
import localization from '../../../model/resources/localization';
import { onlineModeChanged } from '../../../state/uiSlice';

import './LobbyBottomPanel.scss';

const LobbyBottomPanel: React.FC = () => {
	const ui = useAppSelector(state => state.ui);
	const appDispatch = useAppDispatch();

	const changeView = (view: OnlineMode) => {
		appDispatch(onlineModeChanged(view));
	};

	return (<div className='lobbyBottomPanel'>
		<NewGameButton />

		{ui.onlineView === OnlineMode.Games || ui.onlineView === OnlineMode.GameInfo ? (
			<button type='button' className='standard' onClick={() => changeView(OnlineMode.Chat)}>{localization.trends}</button>
		) : <button type='button' className='standard' onClick={() => changeView(OnlineMode.Games)}>{localization.games}</button>}
	</div>);
};

export default LobbyBottomPanel;