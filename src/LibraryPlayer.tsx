import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import runCore from './LibraryCore';
import React from 'react';
import MiniApp from './components/mini/MiniApp/MiniApp';
import Path from './model/enums/Path';
import { INavigationState } from './state/new/uiSlice';
import actionCreators from './logic/actionCreators';
import { Action } from 'redux';
import { changeLogin } from './state/new/userSlice';

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

	let { login } = store.getState().user;

	store.subscribe(() => {
		const state = store.getState();
		const { name } = state.room;

		if (name !== login && name.length > 0) {
			login = name;
			store.dispatch(changeLogin(login));
		}
	});

	ReactDOM.render(
		<Provider store={store}>
			<MiniApp />
		</Provider>,
		host
	);
}