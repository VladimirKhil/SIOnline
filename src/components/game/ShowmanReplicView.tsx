import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import AutoSizedText from '../common/AutoSizedText';
import Account from '../../model/Account';
import Sex from '../../model/enums/Sex';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';

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

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function ShowmanReplicView(props: ShowmanReplicViewProps) {
	const avatar = props.account ? (props.account.avatar ? props.account.avatar : (props.account.sex === Sex.Male ? 'images/avatar-m.png' : 'images/avatar-f.png')) : null;

	return (
		<div className={`showmanArea ${props.decisionNeeded ? 'highlighted' : ''}`}>
			<div className="showmanInfo">
				{avatar ? <div className="showmanAvatar"><img src={avatar} /></div> : null}
				<div className="showmanName">{props.account?.name}</div>
			</div>
			<AutoSizedText id="showmanReplic" maxFontSize={48}>{props.replic || ''}</AutoSizedText>
			{props.isDeciding ?
				<ProgressBar value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0} />
			: null}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowmanReplicView);
