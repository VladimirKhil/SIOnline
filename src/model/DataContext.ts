import * as signalR from '@microsoft/signalr';
import IGameServerClient from '../client/IGameServerClient';
import Config from '../state/Config';

export default interface DataContext {
	config: Config;
	serverUri: string;
	connection: signalR.HubConnection | null;
	gameClient: IGameServerClient;
	contentUris: string[] | null;
}
