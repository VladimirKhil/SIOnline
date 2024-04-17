import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import ShowmanReplic from './ShowmanReplic';
import Account from '../../model/Account';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';
import getAvatarClass from '../../utils/AccountHelpers';
import Sex from '../../model/enums/Sex';
import localization from '../../model/resources/localization';

import './ShowmanReplicView.css';

interface ShowmanReplicViewProps {
	isReady: boolean;
	account: Account;
	decisionNeeded: boolean;
	isDeciding: boolean;
	decisionTimer: TimerInfo;
	hasGameStarted: boolean;
	login: string;
	avatar: string | null;
	showVideoAvatars: boolean;
}

const mapStateToProps = (state: State) => ({
	isReady: state.room.persons.showman.isReady,
	account: state.room.persons.all[state.room.persons.showman.name],
	decisionNeeded: state.room.stage.isDecisionNeeded,
	isDeciding: state.room.persons.showman.isDeciding,
	decisionTimer: state.room.timers.decision,
	hasGameStarted: state.room.stage.isGameStarted,
	login: state.user.login,
	avatar: state.user.avatar,
	showVideoAvatars: state.settings.showVideoAvatars,
});

export function ShowmanReplicView(props: ShowmanReplicViewProps): JSX.Element {
	const isMe = props.account?.name === props.login;

	const avatar = isMe && props.avatar ? props.avatar : props.account?.avatar;

	const avatarStyle : React.CSSProperties = avatar
		? { backgroundImage: `url("${avatar}")` }
		: {};

	const avatarClass = getAvatarClass(props.account);

	const showmanInfoStyle: React.CSSProperties = props.hasGameStarted ? {} : {
		display: 'flex'
	};

	const meClass = isMe ? 'me' : '';

	return (
		<div className={`showmanArea ${props.decisionNeeded ? 'highlighted' : ''}`}>
			<div className="showmanInfo" style={showmanInfoStyle}>
				{props.showVideoAvatars && props.account?.avatarVideo
					? <div className='showmanAvatar'><iframe title='Video avatar' src={props.account?.avatarVideo} /></div>
					: <div className={`showmanAvatar ${avatarClass}`} style={avatarStyle} />}

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

					<span className={meClass}>{props.account?.name}</span>
				</div>
			</div>

			<ShowmanReplic />

			{props.isDeciding ? (
				<ProgressBar
					value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(ShowmanReplicView);
