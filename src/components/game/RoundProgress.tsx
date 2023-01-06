import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';
import localization from '../../model/resources/localization';
import GameStage from '../../model/enums/GameStage';

import './RoundProgress.css';

interface RoundProgressProps {
	roundTimer: TimerInfo;
	roundsNames: string[] | null;
	roundIndex: number;
	stageName: string;
}

const mapStateToProps = (state: State) => ({
	roundTimer: state.run.timers.round,
	roundsNames: state.run.roundsNames,
	roundIndex: state.run.stage.roundIndex,
	stageName: state.run.stage.name,
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
	const roundName = props.roundsNames && props.roundIndex > -1 && props.roundIndex < props.roundsNames.length
		? props.roundsNames[props.roundIndex]
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

export default connect(mapStateToProps, {})(RoundProgress);
