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
	const online = useAppSelector(state => state.online2);
	const common = useAppSelector(state => state.common);

	const filteredGames = filterGames(Object.values(online.games), online.gamesFilter, online.gamesSearch);
	const selectedGame = online.games[online.selectedGameId];

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
				{online.inProgress ? <ProgressBar isIndeterminate /> : null}

				<div className='gamesArea'>
					<GamesControlPanel games={filteredGames} />

					<div className='gamesView'>
						<GamesList games={filteredGames} selectedGameId={online.selectedGameId} />

						{selectedGame
							? <Dialog className="gameInfoView" title={selectedGame.GameName} onClose={onCloseGameInfo}>
								<GameInfoView canJoinAsViewer={true} isConnected={common.isConnected} game={selectedGame} showGameName={false} />
							</Dialog>
							: null}
					</div>
				</div>

				<UsersView />
				{online.newGameShown ? newGame : null}
			</div>

			<LobbyBottomPanel />
		</div>
	);
}

export default Lobby;
