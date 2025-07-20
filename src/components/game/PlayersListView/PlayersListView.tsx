import { connect } from 'react-redux';
import * as React from 'react';
import State from '../../../state/State';
import { Action, Dispatch } from 'redux';
import PlayerInfo from '../../../model/PlayerInfo';
import roomActionCreators from '../../../state/room/roomActionCreators';
import NumericTextBox from '../../common/NumericTextBox/NumericTextBox';
import Persons from '../../../model/Persons';
import getAvatarClass from '../../../utils/AccountHelpers';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { playerSelected } from '../../../state/room2Slice';

import './PlayersListView.css';

interface PlayersListViewProps {
	players: PlayerInfo[];
	all: Persons;
	avatar: string | null;
	isSumEditable: boolean;

	onSumChanged: (playerIndex: number, sum: number) => void;
	onCancelSumChange: () => void;
}

const mapStateToProps = (state: State) => ({
	players: state.room2.persons.players,
	all: state.room2.persons.all,
	avatar: state.user.avatar,
	isSumEditable: state.room.areSumsEditable,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSumChanged: (playerIndex: number, sum: number) => {
		dispatch(roomActionCreators.changePlayerSum(playerIndex, sum) as object as Action);
	},
	onCancelSumChange: () => {
		dispatch(roomActionCreators.areSumsEditableChanged(false) as object as Action);
	},
});

export function PlayersListView(props: PlayersListViewProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const room = useAppSelector(state => state.room2);

	const onSumChanged = (index: number, value: number) => {
		props.onSumChanged(index, value);
	};

	const onPlayerSelected = (index: number) => {
		appDispatch(playerSelected(index));
	};

	return <div className='playerListView'>
		<ul>{props.players.map((player, index) => {
			const account = props.all[player.name];
			const isMe = player.name === room.name;
			const avatarClass = getAvatarClass(account);

			const avatar = isMe && props.avatar ? props.avatar : account?.avatar;

			const avatarStyle : React.CSSProperties = avatar
				? { backgroundImage: `url("${avatar}")` }
				: {};

			return <li key={index} onClick={() => onPlayerSelected(index)}>
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