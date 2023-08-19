const enum GameMessages {
	Banned = 'BANNED',
	BannedList = 'BANNEDLIST',
	/** Game metadata: game name, package name, contact uri. */
	GameMetadata = 'GAMEMETADATA',
	MediaLoaded = 'MEDIALOADED',
	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',
	Unbanned = 'UNBANNED',
}

export default GameMessages;