import React from 'react';
import localization from '../../../model/resources/localization';
import GameInfo from '../../../client/contracts/GameInfo';
import GamesSearch from '../GamesSearch/GamesSearch';
import GamesFilterView from '../GamesFilterView/GamesFilterView';
import NewGameButton from '../NewGameButton/NewGameButton';
import RandomGameButton from '../RandomGameButton/RandomGameButton';

import './GamesControlPanel.scss';

interface GamesControlPanelProps {
	games: GameInfo[];
}

const GamesControlPanel: React.FC<GamesControlPanelProps> = (props: GamesControlPanelProps) => (
	<div className='gamesControlPanel'>
		<div className="gamesTitle">
			<span>{localization.games}</span>
			<span> (</span>
			<span>{props.games.length}</span>
			<span>)</span>
		</div>

		<GamesSearch />
		<GamesFilterView />
		<RandomGameButton />
		<NewGameButton />
	</div>
);

export default GamesControlPanel;