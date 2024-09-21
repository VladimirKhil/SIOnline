import React from 'react';
import localization from '../../../model/resources/localization';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import State from '../../../state/State';
import { connect } from 'react-redux';

import './GamesSearch.scss';

interface GamesSearchProps {
	gamesSearch: string;
	onGamesSearchChanged: (search: string) => void;
}

const mapStateToProps = (state: State) => ({
	gamesSearch: state.online.gamesSearch
});

const mapDispatchToProps = (dispatch: any) => ({
	onGamesSearchChanged: (gamesSearch: string) => {
		dispatch(onlineActionCreators.onGamesSearchChanged(gamesSearch));
	},
});

const GamesSearch: React.FC<GamesSearchProps> = (props: GamesSearchProps) => (
	<input
		id="gamesSearch"
		className="gamesSearch"
		type="search"
		autoComplete="off"
		value={props.gamesSearch}
		placeholder={localization.searchGames}
		onChange={e => props.onGamesSearchChanged(e.target.value)}
	/>
);

export default connect(mapStateToProps, mapDispatchToProps)(GamesSearch);