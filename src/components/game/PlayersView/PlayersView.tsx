import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../../state/State';
import roomActionCreators from '../../../state/room/roomActionCreators';
import PlayerInfo from '../../../model/PlayerInfo';
import Persons from '../../../model/Persons';
import getAvatarClass from '../../../utils/AccountHelpers';
import PlayerView from '../PlayerView/PlayerView';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import { playerSelected } from '../../../state/new/room2Slice';

import './PlayersView.scss';

interface PlayersViewProps {
	players: PlayerInfo[];
	all: Persons;
	avatar: string | null;
	isVisible: boolean;

	onSumChanged: (playerIndex: number, sum: number) => void;
	onShowTables: () => void;
}

const mapStateToProps = (state: State) => ({
	players: state.room2.persons.players,
	all: state.room.persons.all,
	avatar: state.user.avatar,
	isVisible: state.ui.showPlayers,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSumChanged: (playerIndex: number, sum: number) => {
		dispatch(roomActionCreators.changePlayerSum(playerIndex, sum) as object as Action);
	},
	onShowTables: () => {
		dispatch(roomActionCreators.runShowTables());
	},
});

const PlayersView: React.FC<PlayersViewProps> = (props) => {
	const appDispatch = useAppDispatch();
	const room = useAppSelector(state => state.room2);
	const listRef = React.useRef<HTMLUListElement>(null);

	const onPlayerSelected = (index: number) => {
		appDispatch(playerSelected(index));
	};

	const isLarge = props.players.length > 6;

	const renderPlayer = (player: PlayerInfo, index: number): JSX.Element => {
		const account = props.all[player.name];
		const isMe = player.name === room.name;
		const avatar = isMe && props.avatar ? props.avatar : account?.avatar;
		const avatarClass = getAvatarClass(account);

		return <PlayerView
			key={`${player.name}_${index}`}
			listRef={listRef}
			player={player}
			isMe={isMe}
			avatar={avatar}
			sex={account?.sex}
			avatarVideo={account?.avatarVideo}
			avatarClass={avatarClass}
			index={index}
			onPlayerSelected={() => onPlayerSelected(index)}
			onSumChanged={(sum) => props.onSumChanged(index, sum)} />;
	};

	return !props.isVisible ? null : (
		<div className={`playersPanel ${isLarge ? 'large' : ''}`}>
			<ul className="gamePlayers" ref={listRef}>
				{props.players.map(renderPlayer)}
			</ul>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayersView);
