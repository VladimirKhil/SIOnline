/* eslint-disable react/no-unused-prop-types */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import actionCreators from '../state/actionCreators';
import localization from '../model/resources/localization';
import State from '../state/State';
import GameInfo from '../client/contracts/GameInfo';
import { filterGames } from '../utils/GamesHelpers';
import GamesFilter from '../model/enums/GamesFilter';
import NewGameDialog from './NewGameDialog';
import Dialog from './common/Dialog';
import GameInfoView from './GameInfoView';
import uiActionCreators from '../state/ui/uiActionCreators';
import OnlineMode from '../model/enums/OnlineMode';

import './Games.css';

import closeSvg from '../../assets/images/close.svg';

interface GamesProps {
	isConnected: boolean;
	inProgress: boolean;
	error: string;
	gamesSearch: string;
	filteredGames: GameInfo[];
	newGameShown: boolean;
	selectedGameId: number;
	selectedGame?: GameInfo;

	onGamesSearchChanged: (search: string) => void;
	onNewGame: () => void;
	closeNewGame: () => void;
	onSelectGame: (gameId: number, showInfo: boolean) => void;
	unselectGame: () => void;
	onClose: () => void;
}

const mapStateToProps = (state: State) => {
	const filteredGames = state.online.gamesSearch !== null && state.online.gamesSearch.length > 1
		? filterGames(Object.values(state.online.games), GamesFilter.NoFilter, state.online.gamesSearch)
		: [];

	filteredGames.sort((game1, game2) => game1.gameName.localeCompare(game2.gameName));

	const { selectedGameId } = state.online;

	return {
		isConnected: state.common.isConnected,
		inProgress: state.online.inProgress,
		error: state.online.error,
		gamesSearch: state.online.gamesSearch,
		filteredGames,
		newGameShown: state.online.newGameShown,
		selectedGameId,
		selectedGame: state.online.games[selectedGameId]
	};
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onGamesSearchChanged: (gamesSearch: string) => {
		dispatch(actionCreators.onGamesSearchChanged(gamesSearch));
	},
	onNewGame: () => {
		dispatch(actionCreators.newGame());
	},
	closeNewGame: () => {
		dispatch(actionCreators.newGameCancel());
	},
	onSelectGame: (gameId: number, showInfo: boolean) => {
		dispatch(actionCreators.selectGame(gameId));

		if (showInfo) {
			dispatch(uiActionCreators.onOnlineModeChanged(OnlineMode.GameInfo));
		}
	},
	unselectGame: () => {
		dispatch(actionCreators.unselectGame());
	},
	onClose: () => {
		dispatch(uiActionCreators.navigateToWelcome());
	}
});

function renderGameList(props: GamesProps): React.ReactNode {
	if (props.error.length > 0) {
		return <span className="loadError">{props.error}</span>;
	}

	if (props.gamesSearch.length <= 1) {
		return <span className="searchHint">{localization.searchHint}</span>;
	}

	return (
		<ul className="gamenames">
			{props.filteredGames.map(game => (
				<li
					key={game.gameID}
					onClick={() => props.onSelectGame(game.gameID, false)}
				>
					<div className={`gameName ${game.passwordRequired ? 'password' : ''}`}>{game.gameName}</div>
					{game.passwordRequired ? <div className='locked' title={localization.passwordRequired}>🔓</div> : null}
				</li>
			))}
		</ul>
	);
}

export function Games(props: GamesProps): JSX.Element {
	if (props.newGameShown) {
		return <NewGameDialog isSingleGame={false} onClose={props.closeNewGame} />;
	}

	return props.selectedGame ? (
		<Dialog className="gameInfoDialog2" title={props.selectedGame.gameName} onClose={() => props.unselectGame()}>
			<GameInfoView game={props.selectedGame} showGameName={false} />
		</Dialog>
	) : (
		<section className="games">
			<button type="button" className="dialog_closeButton" onClick={props.onClose}>
				<img src={closeSvg} alt={localization.close} />
			</button>
			<div className="games_main">
				<h2>{localization.gamesTitle}</h2>
				<div className="games_controls">
					<input
						id="gamesSearch"
						className="gamesSearch"
						type="search"
						value={props.gamesSearch}
						placeholder={localization.searchGames}
						autoFocus
						onChange={e => props.onGamesSearchChanged(e.target.value)}
					/>
					<button type="button" className='standard' id="newGame" disabled={!props.isConnected} onClick={props.onNewGame}>
						{localization.newGame.toLocaleUpperCase()}
					</button>
				</div>
				{renderGameList(props)}
			</div>
		</section>
	);
}

Games.defaultProps = {
	selectedGame: undefined
};

export default connect(mapStateToProps, mapDispatchToProps)(Games);
