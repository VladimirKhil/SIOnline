import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import GameInfo from '../../../client/contracts/GameInfo';
import { selectGameById } from '../../../state/online2Slice';

import './GamesList.css';

interface GamesListProps {
	games: GameInfo[];
	selectedGameId: number;
}

export default function GamesList(props: GamesListProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const error = useAppSelector(state => state.online2.error);
	const sortedGames = props.games.slice();
	sortedGames.sort((game1, game2) => game1.GameName.localeCompare(game2.GameName));

	const onSelectGame = (gameId: number) => {
		appDispatch(selectGameById(gameId));
	};

	return (
		<section className="gameslistHost gamesblock">
			{error.length === 0 ? (
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
			) : <span className="loadError">{error}</span>}
		</section>
	);
}
