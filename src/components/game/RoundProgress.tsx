import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';
import localization from '../../model/resources/localization';

interface RoundProgressProps {
	roundTimer: TimerInfo;
}

const mapStateToProps = (state: State) => ({
	roundTimer: state.run.timers.round
});

export function RoundProgress(props: RoundProgressProps): JSX.Element {
	return (
		<ProgressBar
			value={1 - props.roundTimer.value / props.roundTimer.maximum}
			valueChangeDuration={isRunning(props.roundTimer) ? (props.roundTimer.maximum - props.roundTimer.value) / 10 : 0}
			title={localization.roundTime}
		/>
	);
}

export default connect(mapStateToProps, {})(RoundProgress);
