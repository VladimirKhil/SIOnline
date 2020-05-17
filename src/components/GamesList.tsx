import * as React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';
import CheckBox from './common/CheckBox';
import GamesFilter from '../model/enums/GamesFilter';
import { connect } from 'react-redux';
import State from '../state/State';
import localization from '../model/resources/localization';
import { getFilterValue } from '../state/getFilterValue';
import actionCreators from '../state/actionCreators';
import OnlineMode from '../model/enums/OnlineMode';
import GameInfo from '../model/server/GameInfo';

import './GamesList.css';

interface GamesListOwnProps {
	onShowGames: () => void;
	onShowChat: () => void;
	onHowToPlay: () => void;
	onExit: () => void;
	onToggleFilterItem: (gamesFilterItem: GamesFilter) => void;
	onSelectGame: (gameId: number, showInfo: boolean) => void;
	onNewAutoSearchGame: () => void;
	onNewGame: () => void;
}

interface GamesListStateProps {
	gamesFilter: GamesFilter;
}

interface GamesListProps extends GamesListOwnProps, GamesListStateProps {
	games: GameInfo[];
	selectedGameId: number;
	showInfo: boolean;
}

const mapStateToProps = (state: State) => ({
	gamesFilter: state.online.gamesFilter
});

const mapDispatchToProps = (dispatch: any) => ({
	onShowGames: () => {
		dispatch(actionCreators.onOnlineModeChanged(OnlineMode.Games));
	},
	onShowChat: () => {
		dispatch(actionCreators.onOnlineModeChanged(OnlineMode.Chat));
	},
	onHowToPlay: () => {
		dispatch(actionCreators.navigateToHowToPlay());
	},
	onExit: () => {
		dispatch(actionCreators.onExit());
	},
	onToggleFilterItem: (gamesFilterItem: GamesFilter) => {
		dispatch(actionCreators.onGamesFilterToggle(gamesFilterItem));
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

// tslint:disable-next-line: function-name
export function GamesList(props: GamesListProps) {
	const filterValue = getFilterValue(props.gamesFilter);

	const sortedGames = props.games.slice();
	sortedGames.sort((game1, game2) => game1.gameName.localeCompare(game2.gameName));

	return (
		<section className="gameslistHost gamesblock">
			<header>
				<FlyoutButton className="navButton" flyout={
					<ul>
						<li onClick={props.onShowGames}>{localization.games}</li>
						<li onClick={props.onShowChat}>{localization.chat}</li>
						<li onClick={props.onHowToPlay}>{localization.howToPlay}</li>
						<li onClick={props.onExit}>{localization.exit}</li>
					</ul>
					} horizontalOrientation={FlyoutHorizontalOrientation.Right}
					verticalOrientation={FlyoutVerticalOrientation.Bottom}>☰</FlyoutButton>
				<h1 id="gamesTitle">{localization.games} (<span>{props.games.length}</span>)</h1>
				<FlyoutButton className="gamesFilterButton" hideOnClick={false} flyout={
					<ul className="gamesFilter">
						<li onClick={() => props.onToggleFilterItem(GamesFilter.New)}>
							<CheckBox isChecked={(props.gamesFilter & GamesFilter.New) > 0} header={localization.new} />
						</li>
						<li onClick={() => props.onToggleFilterItem(GamesFilter.Sport)}>
							<CheckBox isChecked={(props.gamesFilter & GamesFilter.Sport) > 0} header={localization.sportPlural} />
						</li>
						<li onClick={() => props.onToggleFilterItem(GamesFilter.Tv)}>
							<CheckBox isChecked={(props.gamesFilter & GamesFilter.Tv) > 0} header={localization.tvPlural} />
						</li>
						<li onClick={() => props.onToggleFilterItem(GamesFilter.NoPassword)}>
							<CheckBox isChecked={(props.gamesFilter & GamesFilter.NoPassword) > 0} header={localization.withoutPassword} />
						</li>
					</ul>
				} horizontalOrientation={FlyoutHorizontalOrientation.Left}
					verticalOrientation={FlyoutVerticalOrientation.Bottom}>
					<span className="filterText">
						<span style={{ fontSize: filterValue.length > 15 ? '20px' : '26px' }}>{filterValue}</span>
						<span className="triangle">▾</span>
					</span>
				</FlyoutButton>
			</header>
			<ul className="gamenames">
				{sortedGames.map(game => (
					<li key={game.gameID} className={game.gameID === props.selectedGameId ? 'active' : ''}
						onClick={() => props.onSelectGame(game.gameID, props.showInfo)}>
						<div style={{ color: game.passwordRequired ? '#760000' : 'black' }}>{game.gameName}</div>
					</li>
				))}
			</ul>
			<button id="newAutoGame" onClick={props.onNewAutoSearchGame} title={localization.autoSearchHint}>{localization.autoSearch}</button>
			<button id="newGame" onClick={props.onNewGame}>{localization.newGame.toLocaleUpperCase()}</button>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GamesList);
