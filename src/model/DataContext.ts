import * as signalR from '@microsoft/signalr';
import IGameClient from '../client/game/IGameClient';
import IGameServerClient from '../client/IGameServerClient';
import Config from '../Config';
import SIContentClient from 'sicontent-client';
import SIStorageClient from 'sistorage-client';
import IStateManager from '../utils/IStateManager';

/** Provides globally available Redux store data context. */
export default interface DataContext {
	/** Application configuration. */
	config: Config;

	/** Game server uri. */
	serverUri: string;

	/** Game server client. */
	gameClient: IGameServerClient;

	/** Wrapper around Game Server client providing well-formed API. */
	game: IGameClient;

	/** Well-known content source Uris. */
	contentUris: string[] | null;

	/** SIContentService client. */
	contentClient: SIContentClient;

	/** SIStorageService clients. */
	storageClients: SIStorageClient[];

	/** State manager. */
	state: IStateManager;
}
