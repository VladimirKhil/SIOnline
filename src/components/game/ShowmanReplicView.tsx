import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import AutoSizedText from '../common/AutoSizedText';
import Account from '../../model/Account';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';
import StartGameArea from './StartGameArea';
import getAvatar from '../../utils/AccountHelpers';
import Sex from '../../model/enums/Sex';
import localization from '../../model/resources/localization';

import './ShowmanReplicView.css';

interface ShowmanReplicViewProps {
	replic: string | null;
	isReady: boolean;
	account: Account;
	decisionNeeded: boolean;
	isDeciding: boolean;
	decisionTimer: TimerInfo;
	hasGameStarted: boolean;
}

const mapStateToProps = (state: State) => ({
	replic: state.run.persons.showman.replic,
	isReady: state.run.persons.showman.isReady,
	account: state.run.persons.all[state.run.persons.showman.name],
	decisionNeeded: state.run.stage.isDecisionNeeded,
	isDeciding: state.run.persons.showman.isDeciding,
	decisionTimer: state.run.timers.decision,
	hasGameStarted: state.run.stage.isGameStarted
});

export function ShowmanReplicView(props: ShowmanReplicViewProps): JSX.Element {
	const avatar = getAvatar(props.account);

	const showmanInfoStyle: React.CSSProperties = props.hasGameStarted ? {} : {
		display: 'flex'
	};

	return (
		<div className={`showmanArea ${props.decisionNeeded ? 'highlighted' : ''}`}>
			<div className="showmanInfo" style={showmanInfoStyle}>
				{avatar ? <div className="showmanAvatar"><img alt="avatar" src={avatar} /></div> : null}
				<div className="showmanName">
					{props.isReady && !props.hasGameStarted ? (
						<span
							role="img"
							aria-label="checkmark"
							title={props.account?.sex === Sex.Female ? localization.readyFemale : localization.readyMale}
						>
							✔️
						</span>
					) : null}
					<span>{props.account?.name}</span>
				</div>
			</div>
			<AutoSizedText className="showmanReplic" maxFontSize={48}>{props.replic || ''}</AutoSizedText>
			{props.isDeciding ? (
				<ProgressBar
					value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}
			<StartGameArea />
		</div>
	);
}

export default connect(mapStateToProps, {})(ShowmanReplicView);
