import * as React from 'react';
import PlayerInfo from '../../../model/PlayerInfo';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import PlayerStates from '../../../model/enums/PlayerStates';
import NumericTextBox from '../../common/NumericTextBox/NumericTextBox';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import localization from '../../../model/resources/localization';
import Sex from '../../../model/enums/Sex';
import Constants from '../../../model/enums/Constants';
import { isRunning } from '../../../utils/TimerInfoHelpers';
import TimerInfo from '../../../model/TimerInfo';
import State from '../../../state/State';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { Action } from 'redux';
import { connect } from 'react-redux';
import EditTableMenu from '../EditTableMenu/EditTableMenu';
import Account from '../../../model/Account';
import { useAppSelector } from '../../../state/hooks';

import './PlayerView.scss';

interface PlayerViewProps {
	player: PlayerInfo;
	account: Account;
	isMe: boolean;
	sex?: Sex;
	avatar: string | null;
	avatarClass: string | null;
	avatarVideo?: string;
	index: number;
	isSelectionEnabled: boolean;
	decisionTimer: TimerInfo;
	showVideoAvatars: boolean;
	isSumEditable: boolean;
	windowWidth: number;
	windowHeight: number;

	listRef: React.RefObject<HTMLUListElement>;

	onSumChanged: (sum: number) => void;
	onCancelSumChange: () => void;
	onPlayerSelected: () => void;
}

const mapStateToProps = (state: State) => ({
	isSelectionEnabled: state.room.selection.isEnabled,
	decisionTimer: state.room.timers.decision,
	isSumEditable: state.room.areSumsEditable,
	showVideoAvatars: state.settings.showVideoAvatars,
	windowWidth: state.ui.windowWidth,
	windowHeight: state.ui.windowHeight,
});

const mapDispatchToProps = (dispatch: React.Dispatch<Action>) => ({
	onCancelSumChange: () => {
		dispatch(roomActionCreators.areSumsEditableChanged(false) as object as Action);
	},
});

export function PlayerView(props: PlayerViewProps): JSX.Element {
	const replicRef = React.useRef<HTMLDivElement>(null);
	const { player, isMe, sex, avatar, avatarClass, avatarVideo, index } = props;
	const room = useAppSelector(state => state.room2);

	const buildPlayerClasses = () => {
		const stateClass = `state_${(PlayerStates[player.state] ?? '').toLowerCase()}`;
		const meClass = isMe ? 'me' : '';
		const inGameClass = player.inGame ? '' : 'out_of_game';
		const selectableClass = player.canBeSelected && props.isSelectionEnabled ? 'selectable' : '';
		return `playerCard ${stateClass} ${meClass} ${inGameClass} ${selectableClass}`;
	};

	const onSumChanged = (value: number) => {
		props.onSumChanged(value);
		props.onCancelSumChange();
	};

	const onPlayerClicked = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
		props.onPlayerSelected();
		e.stopPropagation();
	};

	const displayedStake = player.stake > 0
		? player.stake.toString()
		: player.stake === Constants.HIDDEN_STAKE ? '######' : null;

	const avatarStyle: React.CSSProperties = avatar
		? { backgroundImage: `url("${avatar}")` }
		: {};

	const moveReplic = (): void => {
		if (props.windowHeight < 600 && props.windowWidth > 600) {
			return;
		}

		const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH;
		const playersAreAtBottom = isScreenWide;

		const replic = replicRef.current;
		const list = props.listRef.current;

		if (replic === null || list === null) {
			return;
		}

		replic.style.transform = 'translate(-50%,0)';

		const replicRect = replic.getBoundingClientRect();
		const listRect = list.getBoundingClientRect();

		let transformX: string | null = null;
		let transformY: string | null = null;

		if (replicRect.left < listRect.left) {
			transformX = `calc(-50% + ${listRect.left - replicRect.left + 1}px)`;
		} else if (replicRect.right > listRect.right) {
			transformX = `calc(-50% - ${replicRect.right - listRect.right + 1}px)`;
		}

		if (!playersAreAtBottom && replicRect.top < listRect.top) {
			transformY = `calc(${listRect.top - replicRect.top + 1}px)`;
		} else if (playersAreAtBottom && replicRect.bottom > listRect.bottom) {
			transformY = `calc(${listRect.bottom - replicRect.bottom - 1}px)`;
		}

		if (transformX || transformY) {
			replic.style.transform = `translate(${transformX ?? '-50%'},${transformY ?? 0})`;
		}
	};

	React.useEffect(() => {
		moveReplic();
	}, [props.windowHeight, props.windowWidth]);

	return (
		<li
			className="gamePlayer"
			onClick={(e) => player.canBeSelected ? onPlayerClicked(e) : null}
		>
			<div className="stakeHost">
				<div className="stake">{displayedStake ?? '\u200b'}</div>
				<div className='answer'>{player.answer}</div>
			</div>

			<div className={buildPlayerClasses()}>
				{props.showVideoAvatars && avatarVideo
					? <div className='playerAvatar'><iframe title='Video avatar' src={avatarVideo} /></div>
					: <div
						className={`playerAvatar ${avatarClass}`}
						style={avatarStyle}
						title={`${player.name} ${player.sum}`}
					/>}

				<div className="playerInfo">
					<div className="name" title={player.name}>
						<AutoSizedText className='nameValue' maxFontSize={48}>
							{player.name}
						</AutoSizedText>
					</div>

					<div className="sum" title={player.sum.toString()}>
						{props.isSumEditable ? (
							<NumericTextBox
								value={player.sum}
								onValueChanged={value => onSumChanged(value)}
								onCancel={props.onCancelSumChange}
							/>
						) : <AutoSizedText className='staticSum' maxFontSize={48}>{player.sum}</AutoSizedText>}
					</div>
				</div>

				<EditTableMenu isPlayerScope={true} account={props.account} tableIndex={index} />
			</div>

			{player.replic && player.replic.length > 0 ? (
				<div ref={replicRef} className="playerReplic replic">
					<AutoSizedText id={`playerReplic_${index}`} className="playerReplicText" maxFontSize={48}>
						{player.replic}
					</AutoSizedText>

					<div className='replicLink' />
				</div>
			) : null}

			{player.isDeciding ? (
				<ProgressBar
					value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer)
						? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}

			<div className='marksArea'>
				{player.isReady && !room.stage.isGameStarted ? (
					<span
						className='readyMark'
						role="img"
						aria-label="checkmark"
						title={sex === Sex.Female ? localization.readyFemale : localization.readyMale}
					>
						✔️
					</span>
				) : null}
				{player.isChooser ? (
					<div className='chooserMark' title={localization.chooserMark} />
				) : null}

				{player.mediaLoaded ? (
					<div className='mediaLoadedMark' title={localization.mediaLoadedMark} />
				) : null}
			</div>

			<div className='preload__progress'>
				{player.mediaPreloadProgress > 0 && player.mediaPreloadProgress <= 100
					? <div title={localization.mediaPreloadProgress}>{player.mediaPreloadProgress}%</div>
					: null}
			</div>
		</li>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerView);