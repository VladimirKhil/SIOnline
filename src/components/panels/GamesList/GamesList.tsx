﻿import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import localization from '../../../model/resources/localization';
import GameInfo from '../../../client/contracts/GameInfo';
import OnlineMode from '../../../model/enums/OnlineMode';
import { onlineModeChanged } from '../../../state/new/uiSlice';
import { selectGameById } from '../../../state/new/online2Slice';

import './GamesList.css';

interface GamesListProps {
	games: GameInfo[];
	selectedGameId: number;
	showInfo: boolean;
}

export default function GamesList(props: GamesListProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const online = useAppSelector(state => state.online2);
	const sortedGames = props.games.slice();
	sortedGames.sort((game1, game2) => game1.GameName.localeCompare(game2.GameName));

	const onSelectGame = (gameId: number) => {
		appDispatch(selectGameById(gameId));

		if (props.showInfo) {
			appDispatch(onlineModeChanged(OnlineMode.GameInfo));
		}
	};

	return (
		<section className="gameslistHost gamesblock">
			{online.error.length === 0 ? (
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
			) : <span className="loadError">{online.error}</span>}
		</section>
	);
}
