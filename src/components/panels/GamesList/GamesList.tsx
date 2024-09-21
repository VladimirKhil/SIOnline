import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import GameInfo from '../../../client/contracts/GameInfo';
import uiActionCreators from '../../../state/ui/uiActionCreators';
import OnlineMode from '../../../model/enums/OnlineMode';

import './GamesList.css';

interface GamesListOwnProps {
	isConnected: boolean;
	error: string;
	onSelectGame: (gameId: number, showInfo: boolean) => void;
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
	onSelectGame: (gameId: number, showInfo: boolean) => {
		dispatch(onlineActionCreators.selectGame(gameId));

		if (showInfo) {
			dispatch(uiActionCreators.onOnlineModeChanged(OnlineMode.GameInfo));
		}
	},
});

export function GamesList(props: GamesListProps): JSX.Element {
	const sortedGames = props.games.slice();
	sortedGames.sort((game1, game2) => game1.GameName.localeCompare(game2.GameName));

	return (
		<section className="gameslistHost gamesblock">
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
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GamesList);
