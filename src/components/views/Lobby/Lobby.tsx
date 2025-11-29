import * as React from 'react';
import { useDispatch } from 'react-redux';
import GamesList from '../../panels/GamesList/GamesList';
import GameInfoView from '../../panels/GameInfoView/GameInfoView';
import UsersView from '../../panels/UsersView/UsersView';
import NewGameDialog from '../../panels/NewGameDialog/NewGameDialog';
import Dialog from '../../common/Dialog/Dialog';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import { filterGames } from '../../../utils/GamesHelpers';
import localization from '../../../model/resources/localization';
import Path from '../../../model/enums/Path';
import UserOptions from '../../panels/UserOptions/UserOptions';
import GamesControlPanel from '../../panels/GamesControlPanel/GamesControlPanel';
import LobbyBottomPanel from '../../panels/LobbyBottomPanel/LobbyBottomPanel';
import { navigate } from '../../../utils/Navigator';
import { useAppSelector } from '../../../state/hooks';
import { newGameCancel, selectGameById } from '../../../state/online2Slice';
import ProgressDialog from '../../panels/ProgressDialog/ProgressDialog';

import './Lobby.css';
import exitImg from '../../../../assets/images/exit.png';

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

export function Lobby() {
	const appDispatch = useDispatch();

	const { games,
		gamesFilter,
		gamesSearch,
		selectedGameId,
		newGameShown,
		gameCreationProgress,
		joinGameProgress,
		inProgress } = useAppSelector(state => ({
		games: state.online2.games,
		gamesFilter: state.online2.gamesFilter,
		gamesSearch: state.online2.gamesSearch,
		selectedGameId: state.online2.selectedGameId,
		newGameShown: state.online2.newGameShown,
		gameCreationProgress: state.online2.gameCreationProgress,
		joinGameProgress: state.online2.joinGameProgress,
		inProgress: state.online2.inProgress
	}));

	const isConnected = useAppSelector(state => state.common.isConnected);

	const filteredGames = filterGames(Object.values(games), gamesFilter, gamesSearch);
	const selectedGame = games[selectedGameId];
	const newGame = (
		<div className='newGameArea'>
			<NewGameDialog isSingleGame={false} onClose={() => appDispatch(newGameCancel())} />
		</div>
	);

	const onExit = () => appDispatch(navigate({ navigation: { path: Path.Menu }, saveState: true }));

	const onCloseGameInfo = () => {
		appDispatch(selectGameById(-1));
	};

	return (
		<div className="lobby">
			{topMenu(onExit)}

			<div className='onlineView'>
				{inProgress ? <ProgressBar isIndeterminate /> : null}

				<div className='gamesArea'>
					<GamesControlPanel games={filteredGames} />

					<div className='gamesView'>
						<GamesList games={filteredGames} selectedGameId={selectedGameId} />

						{selectedGame
							? <Dialog className="gameInfoView" title={selectedGame.GameName} onClose={onCloseGameInfo}>
								<GameInfoView canJoinAsViewer={true} isConnected={isConnected} game={selectedGame} showGameName={false} />
							</Dialog>
							: <div className='emptyGameInfo' />}
					</div>
				</div>

				<UsersView />
				{newGameShown ? newGame : null}

				{!newGameShown && gameCreationProgress
					? <ProgressDialog title={localization.creatingGame} isIndeterminate={true} />
					: null}

				{joinGameProgress
					? <ProgressDialog title={localization.joiningGame} isIndeterminate={true} />
					: null}
			</div>

			<LobbyBottomPanel />
		</div>
	);
}

export default Lobby;
