import * as React from 'react';
import { connect } from 'react-redux';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';
import CheckBox from './common/CheckBox';
import GamesFilter from '../model/enums/GamesFilter';
import State from '../state/State';
import localization from '../model/resources/localization';
import getFilterValue from '../utils/getFilterValue';
import onlineActionCreators from '../state/online/onlineActionCreators';
import GameInfo from '../client/contracts/GameInfo';
import LobbyMenu from './LobbyMenu';
import uiActionCreators from '../state/ui/uiActionCreators';
import OnlineMode from '../model/enums/OnlineMode';

import './GamesList.css';

interface GamesListOwnProps {
	isConnected: boolean;
	error: string;
	onToggleFilterItem: (gamesFilterItem: GamesFilter) => void;
	onGamesSearchChanged: (search: string) => void;
	onSelectGame: (gameId: number, showInfo: boolean) => void;
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
		dispatch(onlineActionCreators.onGamesFilterToggle(gamesFilterItem));
	},
	onGamesSearchChanged: (gamesSearch: string) => {
		dispatch(onlineActionCreators.onGamesSearchChanged(gamesSearch));
	},
	onSelectGame: (gameId: number, showInfo: boolean) => {
		dispatch(onlineActionCreators.selectGame(gameId));

		if (showInfo) {
			dispatch(uiActionCreators.onOnlineModeChanged(OnlineMode.GameInfo));
		}
	},
	onNewGame: () => {
		dispatch(onlineActionCreators.newGame());
	}
});

export function GamesList(props: GamesListProps): JSX.Element {
	const filterValue = getFilterValue(props.gamesFilter);

	const sortedGames = props.games.slice();
	sortedGames.sort((game1, game2) => game1.GameName.localeCompare(game2.GameName));

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
						<span style={{ fontSize: filterValue.length > 15 ? '10px' : '22px' }}>{filterValue}</span>
						<span className="triangle">▾</span>
					</span>
				</FlyoutButton>
			</header>

			<input
				id="gamesSearch"
				className="gamesSearch"
				type="search"
				autoComplete="off"
				value={props.gamesSearch}
				placeholder={localization.searchGames}
				onChange={e => props.onGamesSearchChanged(e.target.value)}
			/>

			{props.error.length === 0 ? (
				<ul className="gamenames">
					{sortedGames.map(game => (
						<li
							key={game.GameID}
							className={game.GameID === props.selectedGameId ? 'active' : ''}
							onClick={() => props.onSelectGame(game.GameID, props.showInfo)}
						>
							<div className={`gameName ${game.PasswordRequired ? 'password' : ''}`} title={game.GameName}>{game.GameName}</div>
							{game.PasswordRequired ? <div className='locked' title={localization.passwordRequired}>🔓</div> : null}
						</li>
					))}
				</ul>
			) : <span className="loadError">{props.error}</span>}

			<div className="commandButtonsPanel">
				<button
					id="newGame"
					className='standard'
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
