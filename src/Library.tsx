// Special entry file for using SIGame Online as a embedded library

import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AnyAction, applyMiddleware, createStore } from 'redux';
import State, { initialState } from './state/State';
import reducer from './state/reducer';
import reduxThunk from 'redux-thunk';
import React from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import GameServerClient from './client/GameServerClient';
import SIContentClient from 'sicontent-client';
import GameClient from './client/game/GameClient';
import DataContext from './model/DataContext';
import ShowmanReplic from './components/game/ShowmanReplic';
import GameTable from './components/gameTable/GameTable';
import ClientController from './logic/ClientController';
import TableMode from './model/enums/TableMode';

declare global {
    interface Window {
        chrome: {
            webview: WebView;
        };
    }
}

interface WebViewEventListenerObject {
    handleEvent(object: Event & { data?: any }): void;
}

interface WebViewEventListener
{
    (evt: Event & { data?: any }): void;
}

type WebViewEventListenerOrEventListenerObject = WebViewEventListener | WebViewEventListenerObject;

interface WebView extends EventTarget {
    /**
     * The standard EventTarget.addEventListener method. Use it to subscribe to the message event
     * or sharedbufferreceived event. The message event receives messages posted from the WebView2
     * host via CoreWebView2.PostWebMessageAsJson or CoreWebView2.PostWebMessageAsString. The
     * sharedbufferreceived event receives shared buffers posted from the WebView2 host via
     * CoreWebView2.PostSharedBufferToScript.
     * See CoreWebView2.PostWebMessageAsJson( Win32/C++, .NET, WinRT).
     * @param type The name of the event to subscribe to. Valid values are message, and sharedbufferreceived.
     * @param listener The callback to invoke when the event is raised.
     * @param options Options to control how the event is handled.
     */
    addEventListener(
        type: string,
        listener: WebViewEventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions): void;
}

function processMessage(controller: ClientController, payload: any) {
	switch (payload.type) {
		case 'answerOptionsLayout':
			controller.onAnswerOptionsLayout(payload.questionHasScreenContent, payload.typeNames);
			break;

		case 'content':
			controller.onContent(payload.placement, payload.content);
			break;

		case 'replic':
			controller.onReplic(payload.personCode, payload.text);
			break;

		case 'answerOption':
			controller.onAnswerOption(payload.index, payload.label, payload.contentType, payload.contentValue);
			break;

		case 'beginPressButton':
			controller.onBeginPressButton();
			break;

		case 'endPressButtonByTimeout':
			controller.onEndPressButtonByTimeout();
			break;

		case 'contentState':
			controller.onContentState(payload.placement, payload.layoutId, payload.itemState);
			break;

		default:
			break;
	}
}

export function runTable(elementId: string): void {
	const host = document.getElementById(elementId);

	if (!host) {
		console.error('host element not found!');
		return;
	}

	const noOpHubConnection = new HubConnectionBuilder().withUrl('http://fake').build();

	const gameClient = new GameServerClient(noOpHubConnection, () => { });

	const dataContext: DataContext = {
		config: {
			siStatisticsServiceUri: '',
		},
		serverUri: '',
		connection: null,
		gameClient,
		game: new GameClient(gameClient),
		contentUris: null,
		contentClient: new SIContentClient({ serviceUri: 'http://fake' }),
		storageClient: null,
		soundPlayer: {
			play() { },
			pause() { },
		}
	};

	const store = createStore<State, AnyAction, {}, {}>(
		reducer,
		{
			...initialState,
			table: {
				...initialState.table,
				mode: TableMode.Void,
			}
		},
		applyMiddleware(reduxThunk.withExtraArgument(dataContext))
	);

	const controller = new ClientController(store.dispatch, store.getState, dataContext);

	if (window.chrome) {
		const { webview } = window.chrome;

		if (webview) {
			webview.addEventListener('message', event => {
				const payload = event.data;
				processMessage(controller, payload);
			});
		}
	}

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