import localization from '../model/resources/localization';
import GameInfo from '../client/contracts/GameInfo';
import getErrorMessage from './ErrorHelpers';
import { AppDispatch } from '../state/store';
import { isConnectedChanged, userErrorChanged } from '../state/commonSlice';
import { gameChanged, gameCreated, gameDeleted } from '../state/online2Slice';
import IGameServerListener from '../client/IGameServerListener';

export default class GameServerListener implements IGameServerListener {
	constructor(private appDispatch: AppDispatch) {}

	onGameCreated = (gameInfo: GameInfo): void => {
		this.appDispatch(gameCreated(gameInfo));
	};

	onGameChanged = (gameInfo: GameInfo): void => {
		this.appDispatch(gameChanged(gameInfo));
	};

	onGameDeleted = (gameId: number): void => {
		this.appDispatch(gameDeleted(gameId));
	};

	onReconnecting = (error?: Error): void => {
		const errorMessage = error ? ` (${error.message})` : '';

		this.appDispatch(isConnectedChanged({
			isConnected: false,
			reason: `${localization.connectionReconnecting}${errorMessage}`,
		}));
	};

	onReconnected = (): void => {
		this.appDispatch(isConnectedChanged({
			isConnected: true,
			reason: localization.connectionReconnected,
		}));
	};

	onClose = (error?: Error): void => {
		if (error) {
			console.log('Connection close error: ' + getErrorMessage(error));
		}

		this.appDispatch(isConnectedChanged({ isConnected: false, reason: '' }));
		this.appDispatch(userErrorChanged(`${localization.connectionClosed} ${error?.message || ''}`));
	};
}
