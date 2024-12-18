import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import runCore from './LibraryCore';
import React from 'react';
import GameTable from './components/gameTable/GameTable/GameTable';
import ShowmanReplic from './components/game/ShowmanReplic/ShowmanReplic';

import './scss/style.scss';

export function run(elementId: string): void {
	const host = document.getElementById(elementId);

	if (!host) {
		console.error('Host element not found!');
		return;
	}

	const store = runCore();

	ReactDOM.render(
		<Provider store={store}>
			<div className='replicAndTable'>
				<ShowmanReplic />
				<GameTable />
			</div>
		</Provider>,
		host
	);
}