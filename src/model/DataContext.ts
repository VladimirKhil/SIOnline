import IGameClient from '../client/game/IGameClient';
import IGameServerClient from '../client/IGameServerClient';
import Config from '../Config';
import SIContentClient from 'sicontent-client';
import IHost from '../host/IHost';
import SIStorageClient from 'sistorage-client';

/** Provides globally available Redux store data context. */
export default interface DataContext {
	/** Application configuration. */
	config: Config;

	/** Game server uri. */
	serverUri: string;

	/** Game server proxy uri. */
	proxyUri?: string;

	/** Game server client. */
	gameClient: IGameServerClient;

	/** Wrapper around Game Server client providing well-formed API. */
	game: IGameClient;

	/** Well-known content source Uris. */
	contentUris: string[] | null;

	/** SIContentService clients. */
	contentClients: SIContentClient[];

	/** SIStorageService clients. */
	storageClients: SIStorageClient[];

	/** Host. */
	host: IHost;

	/** Package file. */
	file?: File;
}
