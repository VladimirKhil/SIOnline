import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import { Action } from 'redux';
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

const mapDispatchToProps = (dispatch: React.Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function RoundProgress(props: RoundProgressProps) {
	return (
		<ProgressBar value={1 - props.roundTimer.value / props.roundTimer.maximum}
			valueChangeDuration={isRunning(props.roundTimer) ? (props.roundTimer.maximum - props.roundTimer.value) / 10 : 0}
			title={localization.roundTime} />
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(RoundProgress);
