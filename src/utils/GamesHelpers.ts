import GamesFilter from '../model/enums/GamesFilter';
import GameInfo from '../client/contracts/GameInfo';
import ServerGameType from '../client/contracts/ServerGameType';
import localization from '../model/resources/localization';
import GameRules, { parseRulesFromString } from '../client/contracts/GameRules';

export function filterGames(games: GameInfo[], filter: GamesFilter, search: string) {
	const filteredGames: GameInfo[] = [];

	const classic = (filter & GamesFilter.Classic) > 0;
	const simple = (filter & GamesFilter.Simple) > 0;
	const quiz = (filter & GamesFilter.Quiz) > 0;
	const turnTaking = (filter & GamesFilter.TurnTaking) > 0;
	const passwordRequired = (filter & GamesFilter.PasswordRequired) > 0;
	const noPassword = (filter & GamesFilter.NoPassword) > 0;
	const oralYes = (filter & GamesFilter.OralYes) > 0;
	const oralNo = (filter & GamesFilter.OralNo) > 0;
	const myLanguage = (filter & GamesFilter.MyLanguage) > 0;
	const otherLanguage = (filter & GamesFilter.OtherLanguage) > 0;
	const hasGameTypeFilter = classic || simple || quiz || turnTaking;
	const hasPasswordFilter = passwordRequired || noPassword;
	const hasOralFilter = oralYes || oralNo;
	const hasLanguageFilter = myLanguage || otherLanguage;

	const normalizedSearch = search.toLocaleLowerCase();
	const currentLanguage = localization.getLanguage();

	const isGameTypeAllowed = (mode: ServerGameType) => {
		if (!hasGameTypeFilter) {
			return true;
		}

		switch (mode) {
			case ServerGameType.Classic:
				return classic;

			case ServerGameType.Simple:
				return simple;

			case ServerGameType.Quiz:
				return quiz;

			case ServerGameType.TurnTaking:
				return turnTaking;

			default:
				return false;
		}
	};

	const isOralAllowed = (rules: string) => {
		if (!hasOralFilter) {
			return true;
		}

		const parsedRules = parseRulesFromString(rules);
		const hasOral = (parsedRules & GameRules.Oral) > 0;

		return hasOral ? oralYes : oralNo;
	};

	const isLanguageAllowed = (language: string) => {
		if (!hasLanguageFilter) {
			return true;
		}

		const isMyLanguage = language?.substring(0, 2) === currentLanguage;

		return isMyLanguage ? myLanguage : otherLanguage;
	};

	for (let j = 0; j < games.length; j++) {
		const game = games[j];

		const filteredOk = isGameTypeAllowed(game.Mode)
			&& (!hasPasswordFilter || (game.PasswordRequired && passwordRequired) || (!game.PasswordRequired && noPassword))
			&& isOralAllowed(game.Rules)
			&& isLanguageAllowed(game.Language)
			&& (normalizedSearch.length === 0 || game.GameName.toLocaleLowerCase().includes(normalizedSearch));

		if (filteredOk) {
			filteredGames.push(games[j]);
		}
	}

	return filteredGames;
}
