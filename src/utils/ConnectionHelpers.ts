import * as signalR from '@microsoft/signalr';
import { Dispatch, AnyAction } from 'redux';
import localization from '../model/resources/localization';
import runActionCreators from '../state/run/runActionCreators';
import actionCreators from '../state/actionCreators';
import Message from '../model/Message';
import messageProcessor from '../state/game/messageProcessor';

export function attachListeners(connection: signalR.HubConnection, dispatch: Dispatch<AnyAction>) {
	connection.on('Joined', (login: string) => dispatch(actionCreators.userJoined(login)));
	connection.on('Leaved', (login: string) => dispatch(actionCreators.userLeaved(login)));
	connection.on('Say', (name: string, text: string) => dispatch(actionCreators.receiveMessage(name, text)));
	connection.on('GameCreated', (game: any) => dispatch(actionCreators.gameCreated(game)));
	connection.on('GameChanged', (game: any) => dispatch(actionCreators.gameChanged(game)));
	connection.on('GameDeleted', (id: number) => dispatch(actionCreators.gameDeleted(id)));

	connection.on('Receive', (message: Message) => messageProcessor(dispatch, message));
	connection.on('Disconnect', () => {
		alert(localization.youAreKicked);
		dispatch((runActionCreators.exitGame() as object) as AnyAction);
	});

	connection.onreconnecting((e) => {
		dispatch(actionCreators.receiveMessage('', `${localization.connectionReconnecting} ${e?.message}`));
	});

	connection.onreconnected(() => {
		dispatch(actionCreators.receiveMessage('', localization.connectionReconnected));
	});

	connection.onclose((e) => {
		dispatch(actionCreators.receiveMessage('', `${localization.connectionClosed} ${e?.message}`));
	});
}

export async function sendMessageToServer(connection: signalR.HubConnection | null, message: string) {
	if (!connection) {
		return;
	}

	await connection.invoke('SendMessage', {
		Text: message,
		IsSystem: true,
		Receiver: '@'
	});
}

export async function say(connection: signalR.HubConnection | null, message: string) {
	if (!connection) {
		return;
	}

	await connection.invoke('SendMessage', {
		Text: message,
		IsSystem: false,
		Receiver: '*'
	});
}

export async function msg(connection: signalR.HubConnection | null, ...args: any[]) {
	if (!connection) {
		return;
	}

	await sendMessageToServer(connection, args.join('\n'));
}
