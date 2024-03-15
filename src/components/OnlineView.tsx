import * as React from 'react';
import { connect } from 'react-redux';
import GamesList from './GamesList';
import State from '../state/State';
import GameInfoView from './GameInfoView';
import UsersView from './UsersView';
import OnlineMode from '../model/enums/OnlineMode';
import NewGameDialog from './NewGameDialog';
import GameInfo from '../client/contracts/GameInfo';
import Dialog from './common/Dialog';
import onlineActionCreators from '../state/online/onlineActionCreators';
import { Dispatch, Action } from 'redux';
import ProgressBar from './common/ProgressBar';
import { filterGames } from '../utils/GamesHelpers';
import SettingsButton from './SettingsButton';
import LobbyChatVisibilityButton from './LobbyChatVisibilityButton';
import uiActionCreators from '../state/ui/uiActionCreators';

import './OnlineView.css';

interface OnlineViewProps {
	inProgress: boolean;
	filteredGames: GameInfo[];
	selectedGameId: number;
	selectedGame?: GameInfo;
	windowWidth: number;
	mode: OnlineMode;
	newGameShown: boolean;
	isLobbyChatHidden: boolean;

	closeGameInfo: () => void;
	closeNewGame: () => void;
}

const mapStateToProps = (state: State) => {
	const filteredGames = filterGames(Object.values(state.online.games), state.online.gamesFilter, state.online.gamesSearch);

	const hasSelectedGame = filteredGames.some(game => game.GameID === state.online.selectedGameId);
	const selectedGameId = hasSelectedGame ? state.online.selectedGameId : (filteredGames.length > 0 ? filteredGames[0].GameID : -1);

	return {
		inProgress: state.online.inProgress,
		filteredGames,
		selectedGameId,
		selectedGame: state.online.games[selectedGameId],
		windowWidth: state.ui.windowWidth,
		mode: state.ui.onlineView,
		newGameShown: state.online.newGameShown,
		isLobbyChatHidden: state.settings.isLobbyChatHidden
	};
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeGameInfo: () => {
		dispatch(uiActionCreators.closeGameInfo());
	},
	closeNewGame: () => {
		dispatch(onlineActionCreators.newGameCancel());
	}
});

export class OnlineView extends React.Component<OnlineViewProps> {
	render() {
		const newGame = (
			<div className={`newGameArea ${this.props.isLobbyChatHidden ? 'newWide' : null}`}>
				<NewGameDialog isSingleGame={false} onClose={this.props.closeNewGame} />
			</div>
		);

		if (this.props.windowWidth < 1100) { // TODO: this should be solved purely in CSS
			if (this.props.mode === OnlineMode.GameInfo && this.props.selectedGame) {
				return (
					<Dialog id="gameInfoDialog" title={this.props.selectedGame.GameName} onClose={() => this.props.closeGameInfo()}>
						<GameInfoView game={this.props.selectedGame} showGameName={false} />
					</Dialog>
				);
			}

			if (this.props.mode === OnlineMode.Games || this.props.mode === OnlineMode.GameInfo) {
				return (
					<div className="onlineView">
						{this.props.inProgress ? <ProgressBar isIndeterminate /> : null}
						<GamesList games={this.props.filteredGames} selectedGameId={this.props.selectedGameId} showInfo />
						{this.props.newGameShown ? newGame : null}
					</div>
				);
			}

			return <div className="onlineView"><UsersView /></div>;
		}

		return (
			<div className="onlineView">
				{this.props.inProgress ? <ProgressBar isIndeterminate /> : null}
				<GamesList games={this.props.filteredGames} selectedGameId={this.props.selectedGameId} showInfo={false} />

				<div className='gameInfoArea'>
					<header />
					<div className='gameInfoAreaContent'><GameInfoView game={this.props.selectedGame} showGameName /></div>
				</div>

				<UsersView />
				<SettingsButton />
				<LobbyChatVisibilityButton />
				{this.props.newGameShown ? newGame : null}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(OnlineView);
