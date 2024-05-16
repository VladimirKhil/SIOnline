import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import runCore from './LibraryCore';
import React from 'react';
import PlayersView from './components/game/PlayersView';
import GameTable from './components/gameTable/GameTable';
import tableActionCreators from './state/table/tableActionCreators';
import IGameClient from './client/game/IGameClient';

import './style.css';

export function run(elementId: string, game?: IGameClient): void {
	const host = document.getElementById(elementId);

	if (!host) {
		console.error('Host element not found!');
		return;
	}

	const store = runCore(game);

	store.dispatch(tableActionCreators.showLogo());

	ReactDOM.render(
		<Provider store={store}>
			<div className='playersAndTable'>
				<PlayersView />
				<GameTable />
			</div>
		</Provider>,
		host
	);
}