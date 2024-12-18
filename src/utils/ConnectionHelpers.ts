import * as signalR from '@microsoft/signalr';
import localization from '../model/resources/localization';
import GameInfo from '../client/contracts/GameInfo';
import IGameServerClient from '../client/IGameServerClient';
import getErrorMessage from './ErrorHelpers';
import { AppDispatch } from '../state/new/store';
import { isConnectedChanged, userErrorChanged } from '../state/new/commonSlice';
import { gameChanged, gameCreated, gameDeleted } from '../state/new/online2Slice';

export const activeConnections: string[] = [];

const detachedConnections: signalR.HubConnection[] = [];

export function attachListeners(
	gameClient: IGameServerClient,
	connection: signalR.HubConnection,
	appDispatch: AppDispatch,
): void {
	connection.on('GameCreated', (game: GameInfo) => appDispatch(gameCreated(game)));
	connection.on('GameChanged', (game: GameInfo) => appDispatch(gameChanged(game)));
	connection.on('GameDeleted', (id: number) => appDispatch(gameDeleted(id)));

	connection.onreconnecting((e) => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		const errorMessage = e ? ` (${e.message})` : '';

		appDispatch(isConnectedChanged({
			isConnected: false,
			reason: `${localization.connectionReconnecting}${errorMessage}`,
		}));
	});

	connection.onreconnected(() => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		appDispatch(isConnectedChanged({
			isConnected: true,
			reason: localization.connectionReconnected,
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

		appDispatch(isConnectedChanged({ isConnected: false, reason: '' }));
		appDispatch(userErrorChanged(`${localization.connectionClosed} ${e?.message || ''}`));
	});
}

export function detachListeners(connection: signalR.HubConnection): void {
	connection.off('GameCreated');
	connection.off('GameChanged');
	connection.off('GameDeleted');

	detachedConnections.push(connection);
}

export function removeConnection(connection: signalR.HubConnection): void {
	detachedConnections.splice(detachedConnections.indexOf(connection), 1);
}
