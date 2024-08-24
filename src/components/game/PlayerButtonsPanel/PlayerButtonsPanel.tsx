import * as React from 'react';
import PassButton from '../PassButton/PassButton';
import GameButton from '../GameButton/GameButton';

import './PlayerButtonsPanel.css';

export function PlayerButtonsPanel(): JSX.Element | null {
	return (
		<div className='playerButtonsPanel'>
			<PassButton />
			<GameButton />
		</div>
	);
}

export default PlayerButtonsPanel;