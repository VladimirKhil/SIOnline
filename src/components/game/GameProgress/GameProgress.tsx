import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import { useAppSelector } from '../../../state/hooks';

import './GameProgress.css';

interface GameProgressProps {
	roundIndex: number;
}

const mapStateToProps = (state: State) => ({
	roundIndex: state.room.stage.roundIndex,
});

export function GameProgress(props: GameProgressProps): JSX.Element | null {
	const roundsNames = useAppSelector(state => state.room2.roundsNames);

	return roundsNames && roundsNames.length > 0 && props.roundIndex > -1 ? (
		<div className='game_progress'>
			{props.roundIndex + 1} / {roundsNames.length}
		</div>
	) : <div className='game_progress' />;
}

export default connect(mapStateToProps)(GameProgress);
