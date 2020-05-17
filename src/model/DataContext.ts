import * as signalR from '@microsoft/signalr';
import Config from '../state/Config';

export default interface DataContext {
	config: Config;
	serverUri: string;
	connection: signalR.HubConnection | null;
	contentUris: string[] | null;
}
