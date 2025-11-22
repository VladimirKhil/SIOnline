import React from 'react';
import NewGameButton from '../NewGameButton/NewGameButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import OnlineMode from '../../../model/enums/OnlineMode';
import localization from '../../../model/resources/localization';
import { onlineModeChanged } from '../../../state/uiSlice';
import RandomGameButton from '../RandomGameButton/RandomGameButton';

import './LobbyBottomPanel.scss';

const LobbyBottomPanel: React.FC = () => {
	const onlineView = useAppSelector(state => state.ui.onlineView);
	const appDispatch = useAppDispatch();

	const changeView = (view: OnlineMode) => {
		appDispatch(onlineModeChanged(view));
	};

	return (<div className='lobbyBottomPanel'>
		<RandomGameButton />
		<NewGameButton simple={true} />

		{onlineView === OnlineMode.Games ? (
			<button type='button' className='standard' onClick={() => changeView(OnlineMode.Trends)}>{localization.trends}</button>
		) : <button type='button' className='standard' onClick={() => changeView(OnlineMode.Games)}>{localization.games}</button>}
	</div>);
};

export default LobbyBottomPanel;