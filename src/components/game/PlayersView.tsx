import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import Account from '../../model/Account';
import runActionCreators from '../../state/run/runActionCreators';

import './PlayersView.css';
import AutoSizedText from '../autoSizedText/AutoSizedText';
import PlayerInfo from '../../model/PlayerInfo';
import Persons from '../../model/Persons';
import PlayerStates from '../../model/enums/PlayerStates';

interface PlayersViewProps {
	players: PlayerInfo[];
	all: Persons;
	login: string;
	isSelectionEnabled: boolean;

	onPlayerSelected: (playerIndex: number) => void;
}

const mapStateToProps = (state: State) => ({
	players: state.run.persons.players,
	all: state.run.persons.all,
	login: state.user.login,
	isSelectionEnabled: state.run.selection.isEnabled
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPlayerSelected: (playerIndex: number) => {
		dispatch(runActionCreators.playerSelected(playerIndex) as object as Action);
	}
});

// tslint:disable-next-line: function-name
export function PlayersView(props: PlayersViewProps) {
	const playersCount = Object.keys(props.players).length;

	const mainStyle: React.CSSProperties = {
		fontSize: `${15.5 - playersCount * 0.5}px`
	};

	const playerStyle: React.CSSProperties = {
		minWidth: `${140 - playersCount * 10}px`
	};

	const buildPlayerClasses = (player: PlayerInfo, isMe: boolean, canBeSelected: boolean) => {
		const s = player.state;
		const stateClass = `state_${PlayerStates[player.state].toLowerCase()}`;
		const meClass = isMe ? 'me' : '';
		const selectableClass = canBeSelected && props.isSelectionEnabled ? 'selectable' : '';
		return `gamePlayer ${stateClass} ${meClass} ${selectableClass}`;
	};

	return (
		<div id="playersPanel">
			<ul className="gamePlayers" style={mainStyle}>
				{props.players.map((player, index) => {
					const account = props.all[player.name];

					return (
						<li key={`${player.name}_${index}`} style={playerStyle}
							className={buildPlayerClasses(player, player.name === props.login, player.canBeSelected)}
							onClick={() => props.onPlayerSelected(index)}>
							{account && account.avatar ? <img className="playerAvatar" src={account.avatar} /> : null}
							<span className="name">{player.name}</span>
							<div className="sum">
								<span>{player.sum}</span>
								{player.stake > 0 ? <span className="stake">{player.stake}</span> : null}
							</div>
							{player.replic && player.replic.length > 0 ? (
								<AutoSizedText id={`playerReplic_${index}`} className="playerReplic"
									text={player.replic} maxFontSize={24} />
								) : null
							}
						</li>
					);
				}
				)
				}
			</ul>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayersView);
