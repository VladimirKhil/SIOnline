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
	const name = useAppSelector(state => state.room2.name);
	const showmanName = useAppSelector(state => state.room2.persons.showman.name);
	const isReady = useAppSelector(state => state.room2.persons.showman.isReady);
	const isDeciding = useAppSelector(state => state.room2.persons.showman.isDeciding);
	const isGameStarted = useAppSelector(state => state.room2.stage.isGameStarted);
	const decisionType = useAppSelector(state => state.room2.stage.decisionType);
	const replicIndex = useAppSelector(state => state.room2.replicIndex);
	const players = useAppSelector(state => state.room2.persons.players);
	const windowWidth = useAppSelector(state => state.ui.windowWidth);
	const deepMode = useAppSelector(state => state.room2.deepMode);
	const role = useAppSelector(state => state.room2.role);
	const mediaPreloadStarted = useAppSelector(state => state.room2.persons.showman.mediaPreloadStarted);
	const mediaPreloadProgress = useAppSelector(state => state.room2.persons.showman.mediaPreloadProgress);

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

	const showmanPreload = !activePlayer && account && mediaPreloadStarted ? (
		<div className='preload__progress'>
			<div className="preload__bar" style={{ width: `${mediaPreloadProgress ?? 0}%` }} title={localization.mediaPreloadProgress} />
			<span className="preload__text">{localization.loading}: {mediaPreloadProgress ?? 0}%</span>
		</div>
	) : null;

	const showmanInfoStyle: React.CSSProperties = isGameStarted && !activePlayer ? {} : {
		display: 'flex'
	};

	const me = players.find(p => p.name === name);
	const meClass = isMe ? 'me' : '';
	const playerReplicModeClass = activePlayer ? 'playerReplicMode' : '';
	const isHighlighted = decisionType !== DecisionType.None && decisionType !== DecisionType.Review;
	const showmanAreaClassName = `showmanArea ${isHighlighted ? 'highlighted' : ''} ${playerReplicModeClass}`;

	const showmanAvatarContent = props.showVideoAvatars && account?.avatarVideo ? (
		<div className='showmanAvatar'>
			<iframe title='Video avatar' src={account?.avatarVideo} />
			{showmanPreload}
		</div>
	) : (
		<div className={`showmanAvatar ${avatarClass}`} style={avatarStyle}>
			{showmanPreload}
		</div>
	);

	const deepModeContent = role === Role.Player ? (
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
	) : null;

	return (
		<div className={showmanAreaClassName}>
			<div className="showmanInfo" style={showmanInfoStyle}>
				{isDeciding ? (
					<ProgressBar
						value={1 - (props.decisionTimer.value / props.decisionTimer.maximum)}
						valueChangeDuration={isRunning(props.decisionTimer)
							? (props.decisionTimer.maximum - props.decisionTimer.value) / 10
							: 0}
					/>
				) : null}

				{!deepMode ? (
					<>
						{showmanAvatarContent}

						<div className="showmanName">
							<span className={meClass}>{account?.name ?? shownName}</span>
						</div>

						{isReady && !isGameStarted ? (
							<div className='marksArea'>
								<span
									className='readyMark'
									role="img"
									aria-label="checkmark"
									title={account?.sex === Sex.Female ? localization.readyFemale : localization.readyMale}
								>
									<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path
											d="M5 13L9 17L19 7"
											stroke="currentColor"
											strokeWidth="3"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</span>
							</div>
						) : null}

						{activePlayer ? null : <EditTableMenu isPlayerScope={false} account={account} tableIndex={0} />}
					</>
				) : deepModeContent}
			</div>

			<ShowmanReplic />
		</div>
	);
}

export default connect(mapStateToProps)(ShowmanReplicView);
