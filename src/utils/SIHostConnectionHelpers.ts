import * as signalR from '@microsoft/signalr';
import { Dispatch, AnyAction } from 'redux';
import localization from '../model/resources/localization';
import Message from '../client/contracts/Message';
import messageProcessor from '../logic/messageProcessor';
import commonActionCreators from '../state/common/commonActionCreators';
import ClientController from '../logic/ClientController';
import roomActionCreators from '../state/room/roomActionCreators';
import ISIHostClient from '../client/ISIHostClient';
import getErrorMessage from './ErrorHelpers';

export const activeSIHostConnections: string[] = [];

const detachedConnections: signalR.HubConnection[] = [];

export function attachSIHostListeners(
	gameClient: ISIHostClient,
	connection: signalR.HubConnection,
	dispatch: Dispatch<AnyAction>,
	controller: ClientController
): void {
	connection.on('Receive', (message: Message) => messageProcessor(controller, dispatch, message));

	connection.on('Disconnect', () => {
		dispatch(roomActionCreators.onKicked());
	});

	connection.onreconnecting((e) => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		const errorMessage = e ? ` (${e.message})` : '';

		dispatch(commonActionCreators.isSIHostConnectedChanged(
			false,
			`${localization.connectionReconnecting}${errorMessage}`
		) as object as AnyAction);
	});

	connection.onreconnected(() => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		dispatch(commonActionCreators.isSIHostConnectedChanged(true, localization.connectionReconnected) as object as AnyAction);
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

		dispatch(commonActionCreators.onSIHostConnectionClosed(`${localization.connectionClosed} ${e?.message || ''}`) as object as AnyAction);
	});
}

export function detachSIHostListeners(connection: signalR.HubConnection): void {
	connection.off('Receive');
	connection.off('Disconnect');

	detachedConnections.push(connection);
}

export function removeSIHostConnection(connection: signalR.HubConnection): void {
	detachedConnections.splice(detachedConnections.indexOf(connection), 1);
}
