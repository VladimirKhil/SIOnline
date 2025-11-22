import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { onGamesSearchChanged } from '../../../state/online2Slice';

import './GamesSearch.scss';

export default function GamesSearch() {
	const gamesSearch = useAppSelector(state => state.online2.gamesSearch);
	const appDispatch = useAppDispatch();

	return (
		<input
			id="gamesSearch"
			className="gamesSearch"
			type="search"
			autoComplete="off"
			value={gamesSearch}
			placeholder={localization.searchGames}
			onChange={e => appDispatch(onGamesSearchChanged(e.target.value))} />
	);
}