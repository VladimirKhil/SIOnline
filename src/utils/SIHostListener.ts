import { AnyAction, Dispatch } from 'redux';
import Message from '../client/contracts/Message';
import ISIHostListener from '../client/ISIHostListener';
import { addOperationErrorMessage, setKicked } from '../state/room2Slice';
import { AppDispatch } from '../state/store';
import getErrorMessage from './ErrorHelpers';
import ClientController from '../logic/ClientController';
import messageProcessor from '../logic/messageProcessor';
import PersonInfo from '../client/contracts/PersonInfo';
import { onGamePersonsChanged } from '../state/online2Slice';
import localization from '../model/resources/localization';
import { isSIHostConnectedChanged, userErrorChanged } from '../state/commonSlice';

export default class SIHostListener implements ISIHostListener {
	constructor(
		private controller: ClientController,
		private dispatch: Dispatch<AnyAction>,
		private appDispatch: AppDispatch
	) {}

	onReceive(message: Message): void {
		messageProcessor(this.controller, this.dispatch, this.appDispatch, message);
	}

	onDisconnect(): void {
		this.appDispatch(setKicked(true));
	}

	onGamePersonsChanged(gameId: number, persons: PersonInfo[]): void {
		this.appDispatch(onGamePersonsChanged({ gameId, persons }));
	}

	onError(e: unknown): void {
		this.appDispatch(addOperationErrorMessage(getErrorMessage(e)));
	}

	onReconnecting(error?: Error): void {
		const errorMessage = error ? ` (${error.message})` : '';

		this.appDispatch(isSIHostConnectedChanged({
			isConnected: false,
			reason: `${localization.connectionReconnecting}${errorMessage}`
		}));
	}

	onReconnected(): void {
		this.appDispatch(isSIHostConnectedChanged({
			isConnected: true,
			reason: localization.connectionReconnected
		}));
	}

	onClose(error?: Error): void {
		this.appDispatch(isSIHostConnectedChanged({ isConnected: false, reason: '' }));
		this.appDispatch(userErrorChanged(`${localization.connectionClosed} ${error?.message || ''}`));
		console.log('Connection close error: ' + getErrorMessage(error));
	}
}