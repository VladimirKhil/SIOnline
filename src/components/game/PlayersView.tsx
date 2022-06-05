import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import runActionCreators from '../../state/run/runActionCreators';
import AutoSizedText from '../common/AutoSizedText';
import PlayerInfo from '../../model/PlayerInfo';
import Persons from '../../model/Persons';
import PlayerStates from '../../model/enums/PlayerStates';
import NumericTextBox from '../common/NumericTextBox';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';
import getAvatar from '../../utils/AccountHelpers';
import Sex from '../../model/enums/Sex';
import localization from '../../model/resources/localization';

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
	players: state.run.persons.players,
	all: state.run.persons.all,
	login: state.user.login,
	avatar: state.user.avatar,
	isSelectionEnabled: state.run.selection.isEnabled,
	isSumEditable: state.run.areSumsEditable,
	decisionTimer: state.run.timers.decision,
	hasGameStarted: state.run.stage.isGameStarted,
	windowWidth: state.ui.windowWidth,
	windowHeight: state.ui.windowHeight
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPlayerSelected: (playerIndex: number) => {
		dispatch(runActionCreators.playerSelected(playerIndex) as object as Action);
	},
	onSumChanged: (playerIndex: number, sum: number) => {
		dispatch(runActionCreators.changePlayerSum(playerIndex, sum) as object as Action);
	},
	onCancelSumChange: () => {
		dispatch(runActionCreators.areSumsEditableChanged(false) as object as Action);
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

		if (replicRect.left < listRect.left) {
			replic.style.transform = `translate(calc(-50% + ${listRect.left - replicRect.left + 1}px),0)`;
		} else if (replicRect.right > listRect.right) {
			replic.style.transform = `translate(calc(-50% - ${replicRect.right - listRect.right + 1}px),0)`;
		}
	};

	render() {
		const playersCount = Object.keys(this.props.players).length;

		const mainStyle: React.CSSProperties = {
			fontSize: `${15.5 - playersCount * 0.2}px`
		};

		const buildPlayerClasses = (player: PlayerInfo, isMe: boolean, canBeSelected: boolean) => {
			const stateClass = `state_${PlayerStates[player.state].toLowerCase()}`;
			const meClass = isMe ? 'me' : '';
			const selectableClass = canBeSelected && this.props.isSelectionEnabled ? 'selectable' : '';
			return `gamePlayer ${stateClass} ${meClass} ${selectableClass}`;
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
						const avatar = isMe ? this.props.avatar : getAvatar(account);

						return (
							<li
								key={`${player.name}_${index}`}
								className={buildPlayerClasses(player, isMe, player.canBeSelected)}
								onClick={() => this.props.onPlayerSelected(index)}
							>
								<div className="playerCard">
									{avatar ? <div className="playerAvatar" style={{ backgroundImage: `url("${avatar}")` }} /> : null}
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
										<div className="sum">
											{this.props.isSumEditable ? (
												<NumericTextBox
													value={player.sum}
													onValueChanged={value => onSumChanged(index, value)}
													onCancel={this.props.onCancelSumChange}
												/>
											) : <span>{player.sum}</span>}
											{player.stake > 0 ? <span className="stake">{player.stake}</span> : null}
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
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayersView);
