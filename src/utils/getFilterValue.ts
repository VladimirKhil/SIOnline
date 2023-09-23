import GamesFilter from '../model/enums/GamesFilter';
import localization from '../model/resources/localization';

export default function getFilterValue(gamesFilter: GamesFilter): string {
	const onlyNew = (gamesFilter & GamesFilter.New) > 0;
	const sport = (gamesFilter & GamesFilter.Sport) > 0;
	const tv = (gamesFilter & GamesFilter.Tv) > 0;
	const noPassword = (gamesFilter & GamesFilter.NoPassword) > 0;

	if (((sport && tv) || (!sport && !tv)) && !onlyNew && !noPassword) {
		return localization.all;
	}

	let value = '';

	if (onlyNew) {
		value += localization.new;
	}

	if (sport && !tv) {
		if (value.length > 0) {
			value += ', ';
		}

		value += localization.sportPlural;
	}

	if (tv && !sport) {
		if (value.length > 0) {
			value += ', ';
		}

		value += localization.tvPlural;
	}

	if (noPassword) {
		if (value.length > 0) {
			value += ', ';
		}

		value += localization.withoutPassword;
	}

	return value;
}
