import * as React from 'react';
import { connect } from 'react-redux';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';
import CheckBox from './common/CheckBox';
import GamesFilter from '../model/enums/GamesFilter';
import State from '../state/State';
import localization from '../model/resources/localization';
import { getFilterValue } from '../state/getFilterValue';
import actionCreators from '../state/actionCreators';
import GameInfo from '../model/server/GameInfo';
import LobbyMenu from './LobbyMenu';

import './GamesList.css';

interface GamesListOwnProps {
	isConnected: boolean;
	error: string;
	onToggleFilterItem: (gamesFilterItem: GamesFilter) => void;
	onGamesSearchChanged: (search: string) => void;
	onSelectGame: (gameId: number, showInfo: boolean) => void;
	onNewAutoSearchGame: () => void;
	onNewGame: () => void;
}

interface GamesListStateProps {
	gamesFilter: GamesFilter;
	gamesSearch: string;
}

interface GamesListProps extends GamesListOwnProps, GamesListStateProps {
	games: GameInfo[];
	selectedGameId: number;
	showInfo: boolean;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	error: state.online.error,
	gamesFilter: state.online.gamesFilter,
	gamesSearch: state.online.gamesSearch
});

const mapDispatchToProps = (dispatch: any) => ({
	onToggleFilterItem: (gamesFilterItem: GamesFilter) => {
		dispatch(actionCreators.onGamesFilterToggle(gamesFilterItem));
	},
	onGamesSearchChanged: (gamesSearch: string) => {
		dispatch(actionCreators.onGamesSearchChanged(gamesSearch));
	},
	onSelectGame: (gameId: number, showInfo: boolean) => {
		dispatch(actionCreators.selectGame(gameId, showInfo));
	},
	onNewAutoSearchGame: () => {
		dispatch(actionCreators.createNewAutoGame());
	},
	onNewGame: () => {
		dispatch(actionCreators.newGame());
	}
});

export function GamesList(props: GamesListProps): JSX.Element {
	const filterValue = getFilterValue(props.gamesFilter);

	const sortedGames = props.games.slice();
	sortedGames.sort((game1, game2) => game1.gameName.localeCompare(game2.gameName));

	const enabledClass = props.isConnected ? '' : 'disabled';

	return (
		<section className="gameslistHost gamesblock">
			<header>
				<LobbyMenu />
				<h1 id="gamesTitle">
					<span>{localization.games}</span>
					<span> (</span>
					<span>{props.games.length}</span>
					<span>)</span>
				</h1>
				<FlyoutButton
					className="gamesFilterButton"
					hideOnClick={false}
					flyout={(
						<ul className="gamesFilter">
							<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.New)}>
								<CheckBox isChecked={(props.gamesFilter & GamesFilter.New) > 0} header={localization.new} />
							</li>
							<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.Sport)}>
								<CheckBox isChecked={(props.gamesFilter & GamesFilter.Sport) > 0} header={localization.sportPlural} />
							</li>
							<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.Tv)}>
								<CheckBox isChecked={(props.gamesFilter & GamesFilter.Tv) > 0} header={localization.tvPlural} />
							</li>
							<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.NoPassword)}>
								<CheckBox isChecked={(props.gamesFilter & GamesFilter.NoPassword) > 0} header={localization.withoutPassword} />
							</li>
						</ul>
					)}
					horizontalOrientation={FlyoutHorizontalOrientation.Left}
					verticalOrientation={FlyoutVerticalOrientation.Bottom}
				>
					<span className="filterText">
						<span style={{ fontSize: filterValue.length > 15 ? '20px' : '26px' }}>{filterValue}</span>
						<span className="triangle">▾</span>
					</span>
				</FlyoutButton>
			</header>
			<input
				id="gamesSearch"
				className="gamesSearch"
				type="search"
				value={props.gamesSearch}
				placeholder={localization.searchGames}
				onChange={e => props.onGamesSearchChanged(e.target.value)}
			/>
			{props.error.length === 0 ? (
				<ul className="gamenames">
					{sortedGames.map(game => (
						<li
							key={game.gameID}
							className={game.gameID === props.selectedGameId ? 'active' : ''}
							onClick={() => props.onSelectGame(game.gameID, props.showInfo)}
						>
							<div style={{ color: game.passwordRequired ? '#760000' : 'black' }}>{game.gameName}</div>
						</li>
					))}
				</ul>
			) : <span className="loadError">{props.error}</span>}
			<div className="commandButtonsPanel">
				<button
					id="newAutoGame"
					type="button"
					disabled={!props.isConnected}
					onClick={props.onNewAutoSearchGame}
					title={localization.autoSearchHint}
				>
					{localization.autoSearch}
				</button>
				<button
					id="newGame"
					type="button"
					disabled={!props.isConnected}
					onClick={props.onNewGame}
				>
					{localization.newGame.toLocaleUpperCase()}
				</button>
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GamesList);
