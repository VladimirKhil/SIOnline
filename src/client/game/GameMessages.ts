const enum GameMessages {
	Banned = 'BANNED',
	BannedList = 'BANNEDLIST',
	MediaLoaded = 'MEDIALOADED',
	/** Toggles (removes or restores a question). */
	Toggle = 'TOGGLE',
	Unbanned = 'UNBANNED',
}

export default GameMessages;