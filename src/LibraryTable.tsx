import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import runCore from './LibraryCore';
import React from 'react';
import PlayersView from './components/game/PlayersView';
import GameTable from './components/gameTable/GameTable';
import IGameClient from './client/game/IGameClient';
import settingsActionCreators from './state/settings/settingsActionCreators';
import AudioController from './components/common/AudioController';
import { showLogo } from './state/new/tableSlice';

import './style.css';

export function run(elementId: string, game?: IGameClient): void {
	const host = document.getElementById(elementId);

	if (!host) {
		console.error('Host element not found!');
		return;
	}

	const store = runCore(game);

	store.dispatch(showLogo());
	store.dispatch(settingsActionCreators.onAppSoundChanged(true));

	ReactDOM.render(
		<Provider store={store}>
			<div className='playersAndTable'>
				<PlayersView />
				<GameTable />
				<AudioController />
			</div>
		</Provider>,
		host
	);
}