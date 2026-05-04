import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import { DecisionType } from '../../../state/room2Slice';
import Role from '../../../model/Role';
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
import Constants from '../../../model/enums/Constants';

import './ShowmanReplicView.scss';

interface ShowmanReplicViewProps {
	all: Persons;
	decisionTimer: TimerInfo;
	avatar: string | null;
	avatarKey: string | null;
	showVideoAvatars: boolean;
}

const mapStateToProps = (state: State) => ({
	all: state.room2.persons.all,
	decisionTimer: state.room2.timers.decision,
	avatar: state.user.avatar,
	avatarKey: state.settings.avatarKey,
	showVideoAvatars: state.settings.showVideoAvatars,
});

export function ShowmanReplicView(props: ShowmanReplicViewProps): JSX.Element {
	const { name, showmanName, isReady, isDeciding, isGameStarted, decisionType, replicIndex, players, windowWidth, deepMode, role } = useAppSelector(state => ({
		name: state.room2.name,
		showmanName: state.room2.persons.showman.name,
		isReady: state.room2.persons.showman.isReady,
		isDeciding: state.room2.persons.showman.isDeciding,
		isGameStarted: state.room2.stage.isGameStarted,
		decisionType: state.room2.stage.decisionType,
		replicIndex: state.room2.replicIndex,
		players: state.room2.persons.players,
		windowWidth: state.ui.windowWidth,
		deepMode: state.room2.deepMode,
		role: state.room2.role,
	}));

	const isScreenWide = windowWidth >= Constants.WIDE_WINDOW_WIDTH;
	const activePlayer = !isScreenWide && replicIndex > -1 && replicIndex < players.length
		? players[replicIndex]
		: null;
	const shownName = activePlayer?.name ?? showmanName;
	const account = props.all[shownName];
	const isMe = account?.name === name;
	const avatar = React.useMemo(() => {
		let currentAvatar = isMe && props.avatar ? props.avatar : account?.avatar;

		if (isMe && !currentAvatar && typeof localStorage !== 'undefined') {
			const localAvatar = localStorage.getItem(Constants.AVATAR_KEY);
			if (localAvatar) {
				currentAvatar = `data:image/png;base64, ${localAvatar}`;
			}
		}

		return currentAvatar;
	}, [isMe, props.avatar, account?.avatar, props.avatarKey]);

	const avatarStyle: React.CSSProperties = avatar
		? { backgroundImage: `url("${avatar}")` }
		: {};

	const avatarClass = getAvatarClass(account);

	const showmanInfoStyle: React.CSSProperties = isGameStarted && !activePlayer ? {} : {
		display: 'flex'
	};

	const me = players.find(p => p.name === name);
	const meClass = isMe ? 'me' : '';
	const playerReplicModeClass = activePlayer ? 'playerReplicMode' : '';

	return (
		<div className={`showmanArea ${(decisionType !== DecisionType.None && decisionType !== DecisionType.Review) ? 'highlighted' : ''} ${playerReplicModeClass}`}>
			<div className="showmanInfo" style={showmanInfoStyle}>
				{!deepMode ? (
					<>
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

							<span className={meClass}>{account?.name ?? shownName}</span>
						</div>

						{activePlayer ? null : <EditTableMenu isPlayerScope={false} account={account} tableIndex={0} />}
					</>
				) : (
					role === Role.Player ? (
						<div className="playerMainInfo">
							<div className="playerMainInfo_item">
								<div className="playerMainInfo_title">{localization.yourScore}</div>
								<div className="playerMainInfo_value" title={localization.score}>{me?.sum ?? 0}</div>
							</div>
							{me?.stake ? (
								<div className="playerMainInfo_item">
									<div className="playerMainInfo_title">{localization.stake}</div>
									<div className="playerMainInfo_value" title={localization.stake}>{me?.stake}</div>
								</div>
							) : null}
						</div>
					) : null
				)}
			</div>

			<ShowmanReplic />

			{isDeciding ? (
				<ProgressBar
					value={1 - (props.decisionTimer.value / props.decisionTimer.maximum)}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(ShowmanReplicView);
