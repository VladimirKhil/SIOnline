import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import runCore from './LibraryCore';
import React from 'react';
import PlayersView from './components/game/PlayersView';
import GameTable from './components/gameTable/GameTable';

import './style.css';
import tableActionCreators from './state/table/tableActionCreators';

export function run(elementId: string): void {
	const host = document.getElementById(elementId);

	if (!host) {
		console.error('Host element not found!');
		return;
	}

	const store = runCore();

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