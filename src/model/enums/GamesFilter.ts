const enum GamesFilter {
	NoFilter = 0,
	Classic = 1,
	Simple = 2,
	Quiz = 4,
	TurnTaking = 8,
	PasswordRequired = 16,
	NoPassword = 32,
	OralYes = 64,
	OralNo = 128,
	MyLanguage = 256,
	OtherLanguage = 512,
	New = 1024,
	Started = 2048,
	Finished = 4096,
	All = 8191,
}

export default GamesFilter;
