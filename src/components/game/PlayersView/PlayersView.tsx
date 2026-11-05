import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import { changePlayerSum } from '../../../state/serverActions';
import PlayerInfo from '../../../client/models/PlayerInfo';
import Persons from '../../../client/models/Persons';
import PlayerStates from '../../../client/models/enums/PlayerStates';
import getAvatarClass from '../../../utils/AccountHelpers';
import PlayerView from '../PlayerView/PlayerView';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { playerSelected } from '../../../state/room2Slice';

import './PlayersView.scss';

interface PlayersViewProps {
	players: PlayerInfo[];
	all: Persons;
	avatar: string | null;
	avatarKey: string | null;
	isVisible: boolean;

}

const mapStateToProps = (state: State) => ({
	players: state.room2.persons.players,
	all: state.room2.persons.all,
	avatar: state.user.avatar,
	avatarKey: state.settings.avatarKey,
	isVisible: state.ui.showPlayers,
});

const PlayersView: React.FC<PlayersViewProps> = (props) => {
	const appDispatch = useAppDispatch();
	const name = useAppSelector(state => state.room2.name);
	const questionType = useAppSelector(state => state.room.stage.questionType);
	const listRef = React.useRef<HTMLUListElement>(null);

	const onPlayerSelected = (index: number) => {
		appDispatch(playerSelected(index));
	};

	const onSumChanged = (playerIndex: number, sum: number) => {
		appDispatch(changePlayerSum({ playerIndex, sum }));
	};

	const isLarge = props.players.length > 6;

	const isSingleAnswererQuestion = !!questionType && !questionType.endsWith('All') && props.players.some(p => p.state === PlayerStates.Press);

	const renderPlayer = (player: PlayerInfo, index: number): JSX.Element => {
		const account = props.all[player.name];
		const isMe = player.name === name;
		const avatar = isMe && props.avatar ? props.avatar : account?.avatar;

		const avatarClass = getAvatarClass(account);
		const isAnswerer = player.state === PlayerStates.Press;
		const isDimmed = isSingleAnswererQuestion && !isAnswerer;

		return <PlayerView
			key={`${player.name}_${index}`}
			listRef={listRef}
			player={player}
			account={account}
			isMe={isMe}
			avatar={avatar}
			avatarKey={props.avatarKey}
			sex={account?.sex}
			avatarVideo={account?.avatarVideo}
			avatarClass={avatarClass}
			index={index}
			isDimmed={isDimmed}
			onPlayerSelected={() => onPlayerSelected(index)}
			onSumChanged={(sum) => onSumChanged(index, sum)} />;
	};

	return !props.isVisible ? null : (
		<div className={`playersPanel ${isLarge ? 'large' : ''}`}>
			<ul className="gamePlayers" ref={listRef}>
				{props.players.map(renderPlayer)}
			</ul>
		</div>
	);
};

export default connect(mapStateToProps)(PlayersView);
