import GamesFilter from '../model/enums/GamesFilter';
import GameInfo from '../client/contracts/GameInfo';
import ServerGameType from '../client/contracts/ServerGameType';
import localization from '../model/resources/localization';

export function filterGames(games: GameInfo[], filter: GamesFilter, search: string) {
	const filteredGames: GameInfo[] = [];

	const onlyNew = (filter & GamesFilter.New) > 0;
	const sport = (filter & GamesFilter.Sport) > 0;
	const tv = (filter & GamesFilter.Tv) > 0;
	const noPassword = (filter & GamesFilter.NoPassword) > 0;
	const myLanguage = (filter & GamesFilter.MyLanguage) > 0;

	const allModes = sport && tv || !sport && !tv;

	const normalizedSearch = search.toLocaleLowerCase();

	for (let j = 0; j < games.length; j++) {
		const game = games[j];

		const filteredOk = (allModes || (game.Mode === ServerGameType.Simple ? sport && !tv : tv && !sport))
			&& (!game.PasswordRequired || !noPassword)
			&& (!game.Started || !onlyNew)
			&& (!myLanguage || game.Language?.substring(0, 2) === localization.getLanguage())
			&& (normalizedSearch.length === 0 || game.GameName.toLocaleLowerCase().includes(normalizedSearch));

		if (filteredOk) {
			filteredGames.push(games[j]);
		}
	}

	return filteredGames;
}
