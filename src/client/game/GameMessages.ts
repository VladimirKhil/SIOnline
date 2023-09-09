/** Defines INCOMING SIGame messages. */
const enum GameMessages {
	Banned = 'BANNED',
	BannedList = 'BANNEDLIST',
	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',
	MediaLoaded = 'MEDIALOADED',
	/** Sets game join mode. */
	SetJoinMode = 'SETJOINMODE',
	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',
	Unbanned = 'UNBANNED',
	/** Answer validation. */
	Validation = 'VALIDATION',
	/** Answer validation. */
	Validation2 = 'VALIDATION2',
}

export default GameMessages;