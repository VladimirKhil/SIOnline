import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import GamesList from '../../panels/GamesList/GamesList';
import State from '../../../state/State';
import GameInfoView from '../../panels/GameInfoView/GameInfoView';
import UsersView from '../../panels/UsersView/UsersView';
import OnlineMode from '../../../model/enums/OnlineMode';
import NewGameDialog from '../../panels/NewGameDialog/NewGameDialog';
import Dialog from '../../common/Dialog/Dialog';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import { Dispatch, Action } from 'redux';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import { filterGames } from '../../../utils/GamesHelpers';
import localization from '../../../model/resources/localization';
import Path from '../../../model/enums/Path';
import UserOptions from '../../panels/UserOptions/UserOptions';
import GamesControlPanel from '../../panels/GamesControlPanel/GamesControlPanel';
import LobbyBottomPanel from '../../panels/LobbyBottomPanel/LobbyBottomPanel';
import { navigate } from '../../../utils/Navigator';
import { closeGameInfo } from '../../../state/new/uiSlice';
import { useAppSelector } from '../../../state/new/hooks';

import './Lobby.css';
import exitImg from '../../../../assets/images/exit.png';

interface LobbyProps {
	windowWidth: number;
	mode: OnlineMode;
	newGameShown: boolean;

	closeNewGame: () => void;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
	mode: state.ui.onlineView,
	newGameShown: state.online.newGameShown,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeNewGame: () => {
		dispatch(onlineActionCreators.newGameCancel());
	},
});

const topMenu = (onExit: () => void) => (
	<header className='main'>
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
);

export function Lobby(props: LobbyProps) {
	const appDispatch = useDispatch();
	const online = useAppSelector(state => state.online2);
	const common = useAppSelector(state => state.common);

	const filteredGames = filterGames(Object.values(online.games), online.gamesFilter, online.gamesSearch);

	const hasSelectedGame = filteredGames.some(game => game.GameID === online.selectedGameId);
	const selectedGameId = hasSelectedGame ? online.selectedGameId : (filteredGames.length > 0 ? filteredGames[0].GameID : -1);
	const selectedGame = online.games[selectedGameId];

	const newGame = (
		<div className='newGameArea'>
			<NewGameDialog isSingleGame={false} onClose={props.closeNewGame} />
		</div>
	);

	const onExit = () => appDispatch(navigate({ navigation: { path: Path.Menu }, saveState: true }));

	const onCloseGameInfo = () => {
		appDispatch(closeGameInfo());
	};

	if (props.windowWidth < 1100) { // TODO: this should be solved purely in CSS
		if (props.mode === OnlineMode.GameInfo && selectedGame) {
			return (
				<Dialog id="gameInfoDialog" title={selectedGame.GameName} onClose={onCloseGameInfo}>
					<GameInfoView isConnected={common.isConnected} game={selectedGame} showGameName={false} />
				</Dialog>
			);
		}

		if (props.mode === OnlineMode.Games || props.mode === OnlineMode.GameInfo) {
			return (
				<div className="lobby">
					<div className="onlineView">
						{online.inProgress ? <ProgressBar isIndeterminate /> : null}

						<div className='gamesBlock'>
							{topMenu(onExit)}
							<GamesControlPanel games={filteredGames} />
							<GamesList games={filteredGames} selectedGameId={selectedGameId} showInfo />
							<LobbyBottomPanel />
						</div>

						{props.newGameShown ? newGame : null}
					</div>
				</div>
			);
		}

		return <div className="lobby">
			{topMenu(onExit)}

			<div className="onlineView">
				<UsersView />
			</div>

			<LobbyBottomPanel />
			{props.newGameShown ? newGame : null}
		</div>;
	}

	return (
		<div className="lobby">
			{topMenu(onExit)}

			<div className='onlineView'>
				{online.inProgress ? <ProgressBar isIndeterminate /> : null}

				<div className='gamesArea'>
					<GamesControlPanel games={filteredGames} />

					<div className='gamesView'>
						<GamesList games={filteredGames} selectedGameId={selectedGameId} showInfo={false} />

						<div className='gameInfoArea'>
							<header />

							<div className='gameInfoAreaContent'>
								<GameInfoView isConnected={common.isConnected} game={selectedGame} showGameName />
							</div>
						</div>
					</div>
				</div>

				<UsersView />
				{props.newGameShown ? newGame : null}
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
