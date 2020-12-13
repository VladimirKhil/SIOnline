import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import AutoSizedText from '../common/AutoSizedText';
import Account from '../../model/Account';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';
import StartGameButton from './StartGameButton';
import getAvatar from '../../utils/AccountHelpers';

import './ShowmanReplicView.css';

interface ShowmanReplicViewProps {
	replic: string | null;
	account: Account;
	decisionNeeded: boolean;
	isDeciding: boolean;
	decisionTimer: TimerInfo;
}

const mapStateToProps = (state: State) => ({
	replic: state.run.persons.showman.replic,
	account: state.run.persons.all[state.run.persons.showman.name],
	decisionNeeded: state.run.stage.isDecisionNeeded,
	isDeciding: state.run.persons.showman.isDeciding,
	decisionTimer: state.run.timers.decision
});

export function ShowmanReplicView(props: ShowmanReplicViewProps): JSX.Element {
	const avatar = getAvatar(props.account);

	return (
		<div className={`showmanArea ${props.decisionNeeded ? 'highlighted' : ''}`}>
			<div className="showmanInfo">
				{avatar ? <div className="showmanAvatar"><img alt="avatar" src={avatar} /></div> : null}
				<div className="showmanName">{props.account?.name}</div>
			</div>
			<AutoSizedText className="showmanReplic" maxFontSize={48}>{props.replic || ''}</AutoSizedText>
			{props.isDeciding ? (
				<ProgressBar
					value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}
			<StartGameButton />
		</div>
	);
}

export default connect(mapStateToProps, {})(ShowmanReplicView);
