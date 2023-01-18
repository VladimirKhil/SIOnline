/** Defines a high level game client built over IGameServerClient layer. */
export default interface IGameClient {	
	/** Sends command to unban the person by IP. */
	unban(ip: string): Promise<boolean>;
}