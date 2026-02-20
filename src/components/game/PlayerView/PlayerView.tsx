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
import { connect } from 'react-redux';
import EditTableMenu from '../EditTableMenu/EditTableMenu';
import Account from '../../../model/Account';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import ScoreEditor from './ScoreEditor/ScoreEditor';
import { setAreSumsEditable } from '../../../state/room2Slice';

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
	windowWidth: number;
	windowHeight: number;
	currentPrice: number;

	listRef: React.RefObject<HTMLUListElement>;

	onSumChanged: (sum: number) => void;
	onPlayerSelected: () => void;
}

const mapStateToProps = (state: State) => ({
	isSelectionEnabled: state.room.selection.isEnabled,
	decisionTimer: state.room2.timers.decision,
	showVideoAvatars: state.settings.showVideoAvatars,
	windowWidth: state.ui.windowWidth,
	windowHeight: state.ui.windowHeight,
	currentPrice: state.room.stage.currentPrice,
});

export function PlayerView(props: PlayerViewProps): JSX.Element {
	const replicRef = React.useRef<HTMLDivElement>(null);
	const scoreEditorRef = React.useRef<HTMLDivElement>(null);
	const sumFieldRef = React.useRef<HTMLDivElement>(null);
	const [isScoreEditorVisible, setIsScoreEditorVisible] = React.useState(false);
	const { player, isMe, sex, avatar, avatarClass, avatarVideo, index } = props;

	const { areSumsEditable, stage } = useAppSelector(state => ({
		areSumsEditable: state.room2.areSumsEditable,
		stage: state.room2.stage,
	}));

	const appDispatch = useAppDispatch();

	// Get the default change value from recent question price (fallback to 100)
	const getDefaultChangeValue = () => props.currentPrice || 100;

	// Hide ScoreEditor when sum editing is disabled
	React.useEffect(() => {
		if (!areSumsEditable && isScoreEditorVisible) {
			setIsScoreEditorVisible(false);
		}
	}, [areSumsEditable]);

	const buildPlayerClasses = () => {
		const stateClass = `state_${(PlayerStates[player.state] ?? '').toLowerCase()}`;
		const meClass = isMe ? 'me' : '';
		const inGameClass = player.inGame ? '' : 'out_of_game';
		const selectableClass = player.canBeSelected && props.isSelectionEnabled ? 'selectable' : '';
		return `playerCard ${stateClass} ${meClass} ${inGameClass} ${selectableClass}`;
	};

	const onCancelSumChange = () => {
		appDispatch(setAreSumsEditable(false));
	};

	const onSumChanged = (value: number) => {
		props.onSumChanged(value);

		if (!isScoreEditorVisible) {
			onCancelSumChange();
		}
	};

	const handleScoreEditorSumChanged = (newSum: number) => {
		props.onSumChanged(player.sum + newSum);
	};

	const handleScoreEditorCancel = () => {
		setIsScoreEditorVisible(false);
		onCancelSumChange();
	};

	const handleScoreEditorBlur = () => {
		// Use setTimeout to allow any click events within the ScoreEditor or sum field to fire first
		setTimeout(() => {
			const { activeElement } = document;
			const scoreEditorElement = scoreEditorRef.current;
			const sumFieldElement = sumFieldRef.current;

			// Check if focus is within ScoreEditor
			if (scoreEditorElement && activeElement && scoreEditorElement.contains(activeElement)) {
				return;
			}

			// Check if focus is on the sum field
			if (sumFieldElement && activeElement && sumFieldElement.contains(activeElement)) {
				return;
			}

			// Focus is outside both ScoreEditor and sum field, hide ScoreEditor
			setIsScoreEditorVisible(false);
		}, 0);
	};

	const handleNumericTextBoxBlur = () => {
		handleScoreEditorBlur();
	};

	const onPlayerClicked = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
		props.onPlayerSelected();
		e.stopPropagation();
	};

	const displayedStake = player.stake > 0
		? player.stake.toString()
		: (player.stake === Constants.HIDDEN_STAKE ? '######' : null);

	// Restore avatar background image style if avatar is present
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
			</div>

			<div className={buildPlayerClasses()}>
				{props.showVideoAvatars && avatarVideo
					? (
						<div className='playerAvatar'><iframe title='Video avatar' src={avatarVideo} /></div>
					) : (
						<div
							className={`playerAvatar ${avatarClass}`}
							style={avatarStyle}
							title={`${player.name} ${player.sum}`}
						>
							{player.answer && (
								<div className="playerAnswerOverlay">
									<AutoSizedText maxFontSize={32} className="playerAnswerOverlayText" title="Player's answer">
										{player.answer}
									</AutoSizedText>
								</div>
							)}
						</div>
					)}

				<div className="playerInfo">
					<div className="name" title={player.name}>
						<AutoSizedText className='nameValue' maxFontSize={48}>
							{player.name}
						</AutoSizedText>

						{areSumsEditable ? (
							<ScoreEditor
								ref={scoreEditorRef}
								currentSum={player.sum}
								defaultChangeValue={getDefaultChangeValue()}
								isVisible={isScoreEditorVisible}
								onSumChanged={handleScoreEditorSumChanged}
								onCancel={handleScoreEditorCancel}
								onBlur={handleScoreEditorBlur}
							/>
						) : null}
					</div>

					<div ref={sumFieldRef} className="sum" title={player.sum.toString()}>
						{areSumsEditable ? (
							<NumericTextBox
								value={player.sum}
								onValueChanged={value => onSumChanged(value)}
								onCancel={onCancelSumChange}
								onFocus={() => setIsScoreEditorVisible(true)}
								onBlur={handleNumericTextBoxBlur}
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
					value={1 - (props.decisionTimer.value / props.decisionTimer.maximum)}
					valueChangeDuration={isRunning(props.decisionTimer)
						? ((props.decisionTimer.maximum - props.decisionTimer.value) / 10) : 0}
				/>
			) : null}

			<div className='marksArea'>
				{player.isReady && !stage.isGameStarted ? (
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

				{player.isAppellating ? (
					<span
						className='appellationMark'
						role="img"
						aria-label="exclamation"
						title={localization.appellationMark}
					>
						❗
					</span>
				) : null}
			</div>

			<div className='preload__progress'>
				{player.mediaPreloadProgress > 0 && player.mediaPreloadProgress <= 100
					? <div title={localization.mediaPreloadProgress}>{localization.loading}: {player.mediaPreloadProgress}%</div>
					: null}
			</div>
		</li>
	);
}

export default connect(mapStateToProps)(PlayerView);