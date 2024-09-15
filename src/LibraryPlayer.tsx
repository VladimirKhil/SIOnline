import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import runCore from './LibraryCore';
import React from 'react';
import MiniApp from './components/mini/MiniApp/MiniApp';
import Path from './model/enums/Path';
import { INavigationState } from './state/ui/UIState';
import actionCreators from './logic/actionCreators';
import { Action } from 'redux';

import './scss/style.scss';

export function run(elementId: string): void {
	const host = document.getElementById(elementId);

	if (!host) {
		console.error('Host element not found!');
		return;
	}

	const gameId = 1;
	const hostUri = window.location.href;

	const initialView: INavigationState = { path: Path.JoinRoom, gameId, hostUri };

	const store = runCore();
	store.dispatch(actionCreators.init(initialView, store.dispatch) as unknown as Action);

	ReactDOM.render(
		<Provider store={store}>
			<MiniApp />
		</Provider>,
		host
	);
}