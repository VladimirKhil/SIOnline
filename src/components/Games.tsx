import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import actionCreators from '../state/actionCreators';
import localization from '../model/resources/localization';
import State from '../state/State';
import GameInfo from '../model/server/GameInfo';
import { filterGames } from '../utils/GamesHelpers';
import GamesFilter from '../model/enums/GamesFilter';
import NewGameDialog from './NewGameDialog';
import Dialog from './common/Dialog';
import GameInfoView from './GameInfoView';

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

	const selectedGameId = state.online.selectedGameId;

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
		dispatch(actionCreators.selectGame(gameId, showInfo));
	},
	unselectGame: () => {
		dispatch(actionCreators.unselectGame());
	},
	onClose: () => {
		dispatch(actionCreators.navigateToWelcome());
	}
});

export class Games extends React.Component<GamesProps> {
	constructor(props: GamesProps) {
		super(props);
	}

	render() {
		return this.props.newGameShown
			? (<NewGameDialog isSingleGame={false} onClose={this.props.closeNewGame} />)
			: this.props.selectedGame ? (
				<Dialog id="gameInfoDialog" title={this.props.selectedGame.gameName} onClose={() => this.props.unselectGame()}>
					<GameInfoView game={this.props.selectedGame} showGameName={false} />
				</Dialog>
			) : (
			<section className="games">
				<button className="dialog_closeButton" onClick={this.props.onClose}>
					<img src={closeSvg} alt={localization.close} />
				</button>
				<div className="games_main">
					<h2>{localization.gamesTitle}</h2>
					<div className="games_controls">
						<input id="gamesSearch" className="gamesSearch" type="search" value={this.props.gamesSearch}
							placeholder={localization.searchGames} autoFocus
							onChange={e => this.props.onGamesSearchChanged(e.target.value)} />
						<button id="newGame" disabled={!this.props.isConnected} onClick={this.props.onNewGame}>
							{localization.newGame.toLocaleUpperCase()}
						</button>
					</div>
					{this.props.error.length === 0 ?
						this.props.gamesSearch.length > 1 ? (
							<ul className="gamenames">
								{this.props.filteredGames.map(game => (
									<li key={game.gameID}
										onClick={() => this.props.onSelectGame(game.gameID, false)}>
										<div style={{ color: game.passwordRequired ? '#760000' : 'black' }}>{game.gameName}</div>
									</li>
								))}
							</ul>
						) : <span className="searchHint">{localization.searchHint}</span>
							: <span className="loadError">{this.props.error}</span>}
				</div>
			</section>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Games);
