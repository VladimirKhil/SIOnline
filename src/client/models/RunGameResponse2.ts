/** Defines a successful v2 game run response. */
export default interface RunGameResponse2 {
	hostUri: string | null;
	gameId: number;
	isHost: boolean;
}
