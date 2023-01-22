/** Defines a high level game client built over IGameServerClient layer. */
export default interface IGameClient {
	/** Toggles (removes or restores) a question on game table. */
	toggle(themeIndex: number, questionIndex: number): Promise<boolean>;
	
	/** Sends command to unban the person by IP. */
	unban(ip: string): Promise<boolean>;
}