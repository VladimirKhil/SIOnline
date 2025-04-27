import * as signalR from '@microsoft/signalr';
import { Dispatch, AnyAction } from 'redux';
import localization from '../model/resources/localization';
import Message from '../client/contracts/Message';
import messageProcessor from '../logic/messageProcessor';
import ClientController from '../logic/ClientController';
import roomActionCreators from '../state/room/roomActionCreators';
import ISIHostClient from '../client/ISIHostClient';
import getErrorMessage from './ErrorHelpers';
import { AppDispatch } from '../state/store';
import PersonInfo from '../client/contracts/PersonInfo';
import { onGamePersonsChanged } from '../state/online2Slice';
import { isSIHostConnectedChanged, userErrorChanged } from '../state/commonSlice';

export const activeSIHostConnections: string[] = [];

const detachedConnections: signalR.HubConnection[] = [];

export function attachSIHostListeners(
	gameClient: ISIHostClient,
	connection: signalR.HubConnection,
	dispatch: Dispatch<AnyAction>,
	appDispatch: AppDispatch,
	controller: ClientController
): void {
	connection.on('Receive', (message: Message) => messageProcessor(controller, dispatch, appDispatch, message));

	connection.on('Disconnect', () => {
		dispatch(roomActionCreators.onKicked(true));
	});

	connection.on('GamePersonsChanged', (gameId: number, persons: PersonInfo[]) => {
		appDispatch(onGamePersonsChanged({ gameId, persons }));
	});

	connection.onreconnecting((e) => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		const errorMessage = e ? ` (${e.message})` : '';

		appDispatch(isSIHostConnectedChanged({
			isConnected: false,
			reason: `${localization.connectionReconnecting}${errorMessage}`
		}));
	});

	connection.onreconnected(async () => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		try {
			await gameClient.reconnectAsync();
		} catch (e) {
			appDispatch(userErrorChanged('Reconnection error: ' + getErrorMessage(e)));
			return;
		}

		appDispatch(isSIHostConnectedChanged({
			isConnected: true,
			reason: localization.connectionReconnected
		}));
	});

	connection.onclose(async (e) => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		if (e) {
			console.log('Connection close error: ' + getErrorMessage(e));

			try {
				await connection.start();
				await gameClient.reconnectAsync();
				return;
			} catch {
				// empty
			}
		}

		appDispatch(isSIHostConnectedChanged({ isConnected: false, reason: '' }));
		appDispatch(userErrorChanged(`${localization.connectionClosed} ${e?.message || ''}`));
	});
}

export function detachSIHostListeners(connection: signalR.HubConnection): void {
	connection.off('Receive');
	connection.off('Disconnect');
	connection.off('GamePersonsChanged');

	detachedConnections.push(connection);
}

export function removeSIHostConnection(connection: signalR.HubConnection): void {
	detachedConnections.splice(detachedConnections.indexOf(connection), 1);
}
