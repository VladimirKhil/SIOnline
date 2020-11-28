import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import runActionCreators from '../../state/run/runActionCreators';
import AutoSizedText from '../common/AutoSizedText';
import PlayerInfo from '../../model/PlayerInfo';
import Persons from '../../model/Persons';
import PlayerStates from '../../model/enums/PlayerStates';
import Sex from '../../model/enums/Sex';
import NumericTextBox from '../common/NumericTextBox';
import ProgressBar from '../common/ProgressBar';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';

import './PlayersView.css';

import avatarMPng from '../../../assets/images/avatar-m.png';
import avatarFPng from '../../../assets/images/avatar-f.png';

interface PlayersViewProps {
	players: PlayerInfo[];
	all: Persons;
	login: string;
	isSelectionEnabled: boolean;
	isSumEditable: boolean;
	decisionTimer: TimerInfo;
	onPlayerSelected: (playerIndex: number) => void;
	onSumChanged: (playerIndex: number, sum: number) => void;
	onCancelSumChange: () => void;
}

const mapStateToProps = (state: State) => ({
	players: state.run.persons.players,
	all: state.run.persons.all,
	login: state.user.login,
	isSelectionEnabled: state.run.selection.isEnabled,
	isSumEditable: state.run.areSumsEditable,
	decisionTimer: state.run.timers.decision
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

export function PlayersView(props: PlayersViewProps) {
	const playersCount = Object.keys(props.players).length;

	const mainStyle: React.CSSProperties = {
		fontSize: `${15.5 - playersCount * 0.2}px`
	};

	const buildPlayerClasses = (player: PlayerInfo, isMe: boolean, canBeSelected: boolean) => {
		const s = player.state;
		const stateClass = `state_${PlayerStates[player.state].toLowerCase()}`;
		const meClass = isMe ? 'me' : '';
		const selectableClass = canBeSelected && props.isSelectionEnabled ? 'selectable' : '';
		return `gamePlayer ${stateClass} ${meClass} ${selectableClass}`;
	};

	const onSumChanged = (index: number, value: number) => {
		props.onSumChanged(index, value);
		props.onCancelSumChange();
	};

	return (
		<div id="playersPanel">
			<ul className="gamePlayers" style={mainStyle}>
				{props.players.map((player, index) => {
					const account = props.all[player.name];
					const avatar = account ? (account.avatar ? account.avatar : (account.sex === Sex.Male ? avatarMPng : avatarFPng)) : null;

					return (
						<li key={`${player.name}_${index}`}
							className={buildPlayerClasses(player, player.name === props.login, player.canBeSelected)}
							onClick={() => props.onPlayerSelected(index)}>
							<div className="playerCard">
								{avatar ? <div className="playerAvatar" style={{ backgroundImage: `url(${avatar})` }} /> : null}
								<div className="playerInfo">
									<span className="name" title={player.name}>{player.name}</span>
									<div className="sum">
										{props.isSumEditable ?
											<NumericTextBox value={player.sum} onValueChanged={value => onSumChanged(index, value)}
												onCancel={props.onCancelSumChange} />
											: <span>{player.sum}</span>
										}
										{player.stake > 0 ? <span className="stake">{player.stake}</span> : null}
									</div>
								</div>
							</div>
							{player.replic && player.replic.length > 0 ? (
								<AutoSizedText id={`playerReplic_${index}`} className="playerReplic" maxFontSize={48}>
									{player.replic}
								</AutoSizedText>
							) : null
							}
							{player.isDeciding ?
								<ProgressBar value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
									valueChangeDuration={isRunning(props.decisionTimer)
										? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0} />
								: null}
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayersView);
