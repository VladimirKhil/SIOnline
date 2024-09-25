import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';

import './GameProgress.css';

interface GameProgressProps {
	roundsNames: string[] | null;
	roundIndex: number;
}

const mapStateToProps = (state: State) => ({
	roundsNames: state.room.roundsNames,
	roundIndex: state.room.stage.roundIndex,
});

export function GameProgress(props: GameProgressProps): JSX.Element | null {
	return props.roundsNames && props.roundIndex > -1 ? (
		<div className='game_progress'>
			{props.roundIndex + 1} / {props.roundsNames.length}
		</div>
	) : <div className='game_progress' />;
}

export default connect(mapStateToProps)(GameProgress);
