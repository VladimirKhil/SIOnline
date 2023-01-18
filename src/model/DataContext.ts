import * as signalR from '@microsoft/signalr';
import IGameClient from '../client/game/IGameClient';
import IGameServerClient from '../client/IGameServerClient';
import Config from '../state/Config';

export default interface DataContext {
	config: Config;
	serverUri: string;
	connection: signalR.HubConnection | null;
	gameClient: IGameServerClient;
	game: IGameClient;
	contentUris: string[] | null;
}
