import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import TimerInfo from '../../../model/TimerInfo';
import { isRunning } from '../../../utils/TimerInfoHelpers';
import localization from '../../../model/resources/localization';
import GameStage from '../../../model/enums/GameStage';
import { useAppSelector } from '../../../state/hooks';

import './RoundProgress.css';

interface RoundProgressProps {
	roundTimer: TimerInfo;
	roundIndex: number;
	stageName: string;
}

const mapStateToProps = (state: State) => ({
	roundTimer: state.room.timers.round,
	roundIndex: state.room.stage.roundIndex,
	stageName: state.room.stage.name,
});

function getLocalizedStageName(stageName: string): string {
	switch (stageName) {
		case GameStage.Begin:
			return localization.gameStarted;

		case GameStage.After:
			return localization.gameFinished;

		default:
			return '';
	}
}

export function RoundProgress(props: RoundProgressProps): JSX.Element {
	const room = useAppSelector(state => state.room2);

	const roundName = room.roundsNames && props.roundIndex > -1 && props.roundIndex < room.roundsNames.length
		? room.roundsNames[props.roundIndex]
		: getLocalizedStageName(props.stageName);

	return (
		<ProgressBar
			className='round_progress'
			value={1 - (props.roundTimer.value / props.roundTimer.maximum)}
			valueChangeDuration={isRunning(props.roundTimer) ? (props.roundTimer.maximum - props.roundTimer.value) / 10 : 0}
			title={localization.timeOfRound}>
			<div className='round_header'>{roundName}</div>
		</ProgressBar>
	);
}

export default connect(mapStateToProps)(RoundProgress);
