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
import { playerSelected, setAreSumsEditable } from '../../../state/room2Slice';

import './PlayersListView.css';

interface PlayersListViewProps {
	players: PlayerInfo[];
	all: Persons;
	avatar: string | null;

	onSumChanged: (playerIndex: number, sum: number) => void;
}

const mapStateToProps = (state: State) => ({
	players: state.room2.persons.players,
	all: state.room2.persons.all,
	avatar: state.user.avatar,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSumChanged: (playerIndex: number, sum: number) => {
		dispatch(roomActionCreators.changePlayerSum(playerIndex, sum) as object as Action);
	},
});

export function PlayersListView(props: PlayersListViewProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const room = useAppSelector(state => state.room2);

	const onSumChanged = (index: number, value: number) => {
		props.onSumChanged(index, value);
	};

	const onCancelSumChange = () => {
		appDispatch(setAreSumsEditable(false));
	};

	const onPlayerSelected = (index: number) => {
		appDispatch(playerSelected(index));
	};

	return <div className='playerListView'>
		<ul>
			{props.players.map((player, index) => {
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
							{room.areSumsEditable ? (
								<NumericTextBox
									value={player.sum}
									onValueChanged={value => onSumChanged(index, value)}
									onCancel={onCancelSumChange}
								/>
							) : <span>{player.sum}</span>}
						</div>
					</div>
				</li>;
			})}
		</ul>
	</div>;
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayersListView);