import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import GameInfo from '../../../client/contracts/GameInfo';
import OnlineMode from '../../../model/enums/OnlineMode';
import { onlineModeChanged } from '../../../state/new/uiSlice';

import './GamesList.css';

interface GamesListOwnProps {
	isConnected: boolean;
	error: string;
	onSelectGame: (gameId: number) => void;
}

interface GamesListProps extends GamesListOwnProps {
	games: GameInfo[];
	selectedGameId: number;
	showInfo: boolean;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	error: state.online.error,
});

const mapDispatchToProps = (dispatch: any) => ({
	onSelectGame: (gameId: number) => {
		dispatch(onlineActionCreators.selectGame(gameId));
	},
});

export function GamesList(props: GamesListProps): JSX.Element {
	const appDispatch = useDispatch();
	const sortedGames = props.games.slice();
	sortedGames.sort((game1, game2) => game1.GameName.localeCompare(game2.GameName));

	const onSelectGame = (gameId: number) => {
		props.onSelectGame(gameId);

		if (props.showInfo) {
			appDispatch(onlineModeChanged(OnlineMode.GameInfo));
		}
	};

	return (
		<section className="gameslistHost gamesblock">
			{props.error.length === 0 ? (
				<ul className="gamenames">
					{sortedGames.map(game => (
						<li
							key={game.GameID}
							className={game.GameID === props.selectedGameId ? 'active' : ''}
							onClick={() => onSelectGame(game.GameID)}
						>
							<div className={`gameName ${game.PasswordRequired ? 'password' : ''}`} title={game.GameName}>{game.GameName}</div>
							{game.PasswordRequired ? <div className='locked' title={localization.passwordRequired}>🔓</div> : null}
						</li>
					))}
				</ul>
			) : <span className="loadError">{props.error}</span>}
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GamesList);
