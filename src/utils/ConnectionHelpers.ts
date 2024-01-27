import * as signalR from '@microsoft/signalr';
import { Dispatch, AnyAction } from 'redux';
import localization from '../model/resources/localization';
import roomActionCreators from '../state/room/roomActionCreators';
import actionCreators from '../logic/actionCreators';
import Message from '../client/contracts/Message';
import messageProcessor from '../logic/messageProcessor';
import GameInfo from '../client/contracts/GameInfo';
import commonActionCreators from '../state/common/commonActionCreators';
import onlineActionCreators from '../state/online/onlineActionCreators';
import IGameServerClient from '../client/IGameServerClient';
import ClientController from '../logic/ClientController';

export const activeConnections: string[] = [];

const detachedConnections: signalR.HubConnection[] = [];

export function attachListeners(
	gameClient: IGameServerClient,
	connection: signalR.HubConnection,
	dispatch: Dispatch<AnyAction>,
	controller: ClientController): void {
	connection.on('Joined', (login: string) => dispatch(onlineActionCreators.userJoined(login)));
	connection.on('Leaved', (login: string) => dispatch(onlineActionCreators.userLeaved(login)));
	connection.on('Say', (name: string, text: string) => dispatch(onlineActionCreators.receiveMessage(name, text)));
	connection.on('GameCreated', (game: GameInfo) => dispatch(onlineActionCreators.gameCreated(game)));
	connection.on('GameChanged', (game: GameInfo) => dispatch(onlineActionCreators.gameChanged(game)));
	connection.on('GameDeleted', (id: number) => dispatch(onlineActionCreators.gameDeleted(id)));

	connection.on('Receive', (message: Message) => messageProcessor(controller, dispatch, message));

	connection.on('Disconnect', () => {
		alert(localization.youAreKicked);
		dispatch((roomActionCreators.exitGame() as object) as AnyAction);
	});

	connection.onreconnecting((e) => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		const errorMessage = e ? ` (${e.message})` : '';
		dispatch(actionCreators.onConnectionChanged(false, `${localization.connectionReconnecting}${errorMessage}`) as object as AnyAction);
	});

	connection.onreconnected(() => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		dispatch(actionCreators.onConnectionChanged(true, localization.connectionReconnected) as object as AnyAction);
	});

	connection.onclose(async (e) => {
		if (detachedConnections.includes(connection)) {
			return;
		}

		try {
			await connection.start();
			await gameClient.reconnectAsync();
			return;
		} catch {
			// empty
		}

		dispatch(commonActionCreators.onConnectionClosed(`${localization.connectionClosed} ${e?.message || ''}`) as object as AnyAction);
	});
}

export function detachListeners(connection: signalR.HubConnection): void {
	connection.off('Joined');
	connection.off('Leaved');
	connection.off('Say');
	connection.off('GameCreated');
	connection.off('GameChanged');
	connection.off('GameDeleted');
	connection.off('Receive');
	connection.off('Disconnect');

	detachedConnections.push(connection);
}

export function removeConnection(connection: signalR.HubConnection): void {
	detachedConnections.splice(detachedConnections.indexOf(connection), 1);
}
