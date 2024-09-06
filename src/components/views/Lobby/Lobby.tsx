import * as React from 'react';
import { connect } from 'react-redux';
import GamesList from '../../GamesList';
import State from '../../../state/State';
import GameInfoView from '../../GameInfoView';
import UsersView from '../../panels/UsersView/UsersView';
import OnlineMode from '../../../model/enums/OnlineMode';
import NewGameDialog from '../../panels/NewGameDialog/NewGameDialog';
import GameInfo from '../../../client/contracts/GameInfo';
import Dialog from '../../common/Dialog/Dialog';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import { Dispatch, Action } from 'redux';
import ProgressBar from '../../common/ProgressBar';
import { filterGames } from '../../../utils/GamesHelpers';
import uiActionCreators from '../../../state/ui/uiActionCreators';
import localization from '../../../model/resources/localization';
import Path from '../../../model/enums/Path';
import UserOptions from '../../panels/UserOptions/UserOptions';

import './Lobby.css';
import exitImg from '../../../../assets/images/exit.png';

interface LobbyProps {
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
	navigate: (path: Path) => void;
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
	},
	navigate: (path: Path) => {
		dispatch(uiActionCreators.navigate({ path: path }) as unknown as Action);
	}
});

export function Lobby(props: LobbyProps) {
	const newGame = (
		<div className={`newGameArea ${props.isLobbyChatHidden ? 'newWide' : null}`}>
			<NewGameDialog isSingleGame={false} onClose={props.closeNewGame} />
		</div>
	);

	const onExit = () => {
		props.navigate(Path.Menu);
	};

	if (props.windowWidth < 1100) { // TODO: this should be solved purely in CSS
		if (props.mode === OnlineMode.GameInfo && props.selectedGame) {
			return (
				<Dialog id="gameInfoDialog" title={props.selectedGame.GameName} onClose={() => props.closeGameInfo()}>
					<GameInfoView game={props.selectedGame} showGameName={false} />
				</Dialog>
			);
		}

		if (props.mode === OnlineMode.Games || props.mode === OnlineMode.GameInfo) {
			return (
				<div className="lobby">
					<div className="onlineView">
						{props.inProgress ? <ProgressBar isIndeterminate /> : null}
						<GamesList games={props.filteredGames} selectedGameId={props.selectedGameId} showInfo />
						{props.newGameShown ? newGame : null}
					</div>
				</div>
			);
		}

		return <div className="lobby"><div className="onlineView"><UsersView /></div></div>;
	}

	return (
		<div className="lobby">
			<header>
				<h1 className='mainHeader'>
					<span className='left'>
						<button
							type='button'
							className='standard imageButton welcomeExit'
							onClick={onExit}
							title={localization.exit}>
							<img src={exitImg} alt='Exit' />
						</button>
					</span>

					<div className='right'>
						<UserOptions />
					</div>
				</h1>
			</header>

			<div className='onlineView'>
				{props.inProgress ? <ProgressBar isIndeterminate /> : null}
				<GamesList games={props.filteredGames} selectedGameId={props.selectedGameId} showInfo={false} />

				<div className='gameInfoArea'>
					<header />
					<div className='gameInfoAreaContent'><GameInfoView game={props.selectedGame} showGameName /></div>
				</div>

				<UsersView />
				{props.newGameShown ? newGame : null}
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
