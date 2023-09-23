import { connect } from 'react-redux';
import * as React from 'react';
import State from '../../../state/State';
import { Action, Dispatch } from 'redux';
import PlayerInfo from '../../../model/PlayerInfo';
import roomActionCreators from '../../../state/room/roomActionCreators';
import NumericTextBox from '../../common/NumericTextBox';
import Persons from '../../../model/Persons';
import getAvatarClass from '../../../utils/AccountHelpers';

import './PlayersListView.css';

interface PlayersListViewProps {
	players: PlayerInfo[];
	all: Persons;
	login: string;
	avatar: string | null;
	isSumEditable: boolean;

	onPlayerSelected: (playerIndex: number) => void;
	onSumChanged: (playerIndex: number, sum: number) => void;
	onCancelSumChange: () => void;
}

const mapStateToProps = (state: State) => ({
	players: state.room.persons.players,
	all: state.room.persons.all,
	login: state.user.login,
	avatar: state.user.avatar,
	isSumEditable: state.room.areSumsEditable,
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
	},
});

export function PlayersListView(props: PlayersListViewProps): JSX.Element {
	const onSumChanged = (index: number, value: number) => {
		props.onSumChanged(index, value);
	};

	return <div className='playerListView'>
		<ul>{props.players.map((player, index) => {
			const account = props.all[player.name];
			const isMe = player.name === props.login;
			const avatarClass = getAvatarClass(account);

			const avatar = isMe && props.avatar ? props.avatar : account?.avatar;

			const avatarStyle : React.CSSProperties = avatar
				? { backgroundImage: `url("${avatar}")` }
				: {};

			return <li onClick={() => props.onPlayerSelected(index)}>
				<div className={`playerAvatar2 ${avatarClass}`} style={avatarStyle} title={`${player.name} ${player.sum}`} />

				<div className="playerInfo2">
					<div className="name">{player.name}</div>

					<div className="sum" title={player.sum.toString()}>
						{props.isSumEditable ? (
							<NumericTextBox
								value={player.sum}
								onValueChanged={value => onSumChanged(index, value)}
								onCancel={props.onCancelSumChange}
							/>
						) : <span>{player.sum}</span>}
					</div>
				</div>
			</li>})}
		</ul>
	</div>;
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayersListView);