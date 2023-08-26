import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import roomActionCreators from '../../state/room/roomActionCreators';
import AutoSizedText from '../common/AutoSizedText';
import PlayerInfo from '../../model/PlayerInfo';
import Persons from '../../model/Persons';
import PlayerStates from '../../model/enums/PlayerStates';
import NumericTextBox from '../common/NumericTextBox';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';
import getAvatarClass from '../../utils/AccountHelpers';
import Sex from '../../model/enums/Sex';
import localization from '../../model/resources/localization';
import Constants from '../../model/enums/Constants';

import './PlayersView.css';

interface PlayersViewProps {
	players: PlayerInfo[];
	all: Persons;
	login: string;
	avatar: string | null;
	isSelectionEnabled: boolean;
	isSumEditable: boolean;
	decisionTimer: TimerInfo;
	hasGameStarted: boolean;
	windowWidth: number;
	windowHeight: number;
	onPlayerSelected: (playerIndex: number) => void;
	onSumChanged: (playerIndex: number, sum: number) => void;
	onCancelSumChange: () => void;
}

const mapStateToProps = (state: State) => ({
	players: state.room.persons.players,
	all: state.room.persons.all,
	login: state.user.login,
	avatar: state.user.avatar,
	isSelectionEnabled: state.room.selection.isEnabled,
	isSumEditable: state.room.areSumsEditable,
	decisionTimer: state.room.timers.decision,
	hasGameStarted: state.room.stage.isGameStarted,
	windowWidth: state.ui.windowWidth,
	windowHeight: state.ui.windowHeight
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPlayerSelected: (playerIndex: number) => {
		dispatch(roomActionCreators.playerSelected(playerIndex) as object as Action);
	},
	onSumChanged: (playerIndex: number, sum: number) => {
		dispatch(roomActionCreators.changePlayerSum(playerIndex, sum) as object as Action);
	},
	onCancelSumChange: () => {
		dispatch(roomActionCreators.areSumsEditableChanged(false) as object as Action);
	}
});

export class PlayersView extends React.Component<PlayersViewProps> {
	private replicRef: React.RefObject<HTMLDivElement>;

	private listRef: React.RefObject<HTMLUListElement>;

	constructor(props: PlayersViewProps) {
		super(props);

		this.replicRef = React.createRef<HTMLDivElement>();
		this.listRef = React.createRef<HTMLUListElement>();
	}

	componentDidMount(): void {
		this.moveReplic();
	}

	componentDidUpdate(): void {
		this.moveReplic();
	}

	moveReplic = (): void => {
		if (this.props.windowHeight < 600 && this.props.windowWidth > 600) {
			return;
		}

		const replic = this.replicRef.current;
		const list = this.listRef.current;

		if (replic === null || list === null) {
			return;
		}

		const replicRect = replic.getBoundingClientRect();
		const listRect = list.getBoundingClientRect();

		let transformX: string | null = null;
		let transformY: string | null = null;

		if (replicRect.left < listRect.left) {
			transformX = `calc(-50% + ${listRect.left - replicRect.left + 1}px)`;
		} else if (replicRect.right > listRect.right) {
			transformX = `calc(-50% - ${replicRect.right - listRect.right + 1}px)`;
		}

		if (replicRect.top < listRect.top) {
			transformY = `calc(${listRect.top - replicRect.top + 1}px)`;
		} else if (replicRect.bottom > listRect.bottom) {
			transformY = `calc(${listRect.bottom - replicRect.bottom - 1}px)`;
		}

		if (transformX || transformY) {
			replic.style.transform = `translate(${transformX ?? '-50%'},${transformY ?? 0})`;
		}
	};

	render() {
		const playersCount = Object.keys(this.props.players).length;

		const mainStyle: React.CSSProperties = {
			fontSize: `${15.5 - playersCount * 0.2}px`
		};

		const buildPlayerClasses = (player: PlayerInfo, isMe: boolean, canBeSelected: boolean) => {
			const stateClass = `state_${(PlayerStates[player.state] ?? '').toLowerCase()}`;
			const meClass = isMe ? 'me' : '';
			const inGameClass = player.inGame ? '' : 'out_of_game';
			const selectableClass = canBeSelected && this.props.isSelectionEnabled ? 'selectable' : '';
			return `gamePlayer ${stateClass} ${meClass} ${inGameClass} ${selectableClass}`;
		};

		const onSumChanged = (index: number, value: number) => {
			this.props.onSumChanged(index, value);
			this.props.onCancelSumChange();
		};

		return (
			<div id="playersPanel">
				<ul className="gamePlayers" style={mainStyle} ref={this.listRef}>
					{this.props.players.map((player, index) => {
						const account = this.props.all[player.name];
						const isMe = player.name === this.props.login;

						const avatar = isMe && this.props.avatar ? this.props.avatar : account?.avatar;

						const avatarStyle : React.CSSProperties = avatar
							? { backgroundImage: `url("${avatar}")` }
							: {};

						const avatarClass = getAvatarClass(account);

						const displayedStake = player.stake > 0
							? player.stake.toString()
							: player.stake === Constants.HIDDEN_STAKE ? '######' : null;

						return (
							<li
								key={`${player.name}_${index}`}
								className={buildPlayerClasses(player, isMe, player.canBeSelected)}
								onClick={() => player.canBeSelected ? this.props.onPlayerSelected(index) : null}
							>
								<div className="playerCard">
									<div className={`playerAvatar ${avatarClass}`} style={avatarStyle} />
									<div className="playerInfo">
										<div className="name" title={player.name}>
											{player.isReady && !this.props.hasGameStarted ? (
												<span
													role="img"
													aria-label="checkmark"
													title={account?.sex === Sex.Female ? localization.readyFemale : localization.readyMale}
												>
													✔️
												</span>
											) : null}
											<span>{player.name}</span>
										</div>

										<div className="sum" title={player.sum.toString()}>
											{this.props.isSumEditable ? (
												<NumericTextBox
													value={player.sum}
													onValueChanged={value => onSumChanged(index, value)}
													onCancel={this.props.onCancelSumChange}
												/>
											) : <span>{player.sum}</span>}
										</div>

										<div className="stakeHost">
											<span className="stake">{displayedStake ?? '\u200b'}</span>
										</div>
									</div>
								</div>

								{player.replic && player.replic.length > 0 ? (
									<div ref={this.replicRef} className="playerReplic">
										<AutoSizedText id={`playerReplic_${index}`} className="playerReplicText" maxFontSize={48}>
											{player.replic}
										</AutoSizedText>
										<div className='replicLink' />
									</div>
								) : null}

								{player.isDeciding ? (
									<ProgressBar
										value={1 - this.props.decisionTimer.value / this.props.decisionTimer.maximum}
										valueChangeDuration={isRunning(this.props.decisionTimer)
											? (this.props.decisionTimer.maximum - this.props.decisionTimer.value) / 10 : 0}
									/>
								) : null}

								{player.isChooser ? (
									<div className='chooserMark' title={localization.chooserMark} />
								) : null}

								{player.mediaLoaded ? (
									<div className='mediaLoadedMark' title={localization.mediaLoadedMark} />
								) : null}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayersView);
