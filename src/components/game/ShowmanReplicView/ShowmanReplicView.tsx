import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import { DecisionType } from '../../../state/room2Slice';
import ShowmanReplic from '../ShowmanReplic/ShowmanReplic';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import TimerInfo from '../../../model/TimerInfo';
import { isRunning } from '../../../utils/TimerInfoHelpers';
import getAvatarClass from '../../../utils/AccountHelpers';
import Sex from '../../../model/enums/Sex';
import localization from '../../../model/resources/localization';
import { useAppSelector } from '../../../state/hooks';
import Persons from '../../../model/Persons';
import EditTableMenu from '../EditTableMenu/EditTableMenu';

import './ShowmanReplicView.scss';

interface ShowmanReplicViewProps {
	all: Persons;
	decisionTimer: TimerInfo;
	avatar: string | null;
	showVideoAvatars: boolean;
}

const mapStateToProps = (state: State) => ({
	all: state.room2.persons.all,
	decisionTimer: state.room2.timers.decision,
	avatar: state.user.avatar,
	showVideoAvatars: state.settings.showVideoAvatars,
});

export function ShowmanReplicView(props: ShowmanReplicViewProps): JSX.Element {
	const { name, showmanName, isReady, isDeciding, isGameStarted, decisionType } = useAppSelector(state => ({
		name: state.room2.name,
		showmanName: state.room2.persons.showman.name,
		isReady: state.room2.persons.showman.isReady,
		isDeciding: state.room2.persons.showman.isDeciding,
		isGameStarted: state.room2.stage.isGameStarted,
		decisionType: state.room2.stage.decisionType,
	}));

	const account = props.all[showmanName];
	const isMe = account?.name === name;

	const avatar = isMe && props.avatar ? props.avatar : account?.avatar;

	const avatarStyle : React.CSSProperties = avatar
		? { backgroundImage: `url("${avatar}")` }
		: {};

	const avatarClass = getAvatarClass(account);

	const showmanInfoStyle: React.CSSProperties = isGameStarted ? {} : {
		display: 'flex'
	};

	const meClass = isMe ? 'me' : '';

	return (
		<div className={`showmanArea ${decisionType !== DecisionType.None ? 'highlighted' : ''}`}>
			<div className="showmanInfo" style={showmanInfoStyle}>
				{props.showVideoAvatars && account?.avatarVideo
					? <div className='showmanAvatar'><iframe title='Video avatar' src={account?.avatarVideo} /></div>
					: <div className={`showmanAvatar ${avatarClass}`} style={avatarStyle} />}

				<div className="showmanName">
					{isReady && !isGameStarted ? (
						<span
							role="img"
							aria-label="checkmark"
							title={account?.sex === Sex.Female ? localization.readyFemale : localization.readyMale}
						>
							✔️
						</span>
					) : null}

					<span className={meClass}>{account?.name}</span>
				</div>

				<EditTableMenu isPlayerScope={false} account={account} tableIndex={0} />
			</div>

			<ShowmanReplic />

			{isDeciding ? (
				<ProgressBar
					value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(ShowmanReplicView);
