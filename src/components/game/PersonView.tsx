import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import Account from '../../model/Account';
import Sex from '../../model/enums/Sex';
import localization from '../../model/resources/localization';
import roomActionCreators from '../../state/room/roomActionCreators';
import State from '../../state/State';

import './PersonView.css';

interface PersonViewProps {
	account: Account;
	selectedPersonName: string | null;
	login: string;
	avatar: string | null;
	hostName: string | null;
	selectPerson: (name: string) => void;
}

const mapStateToProps = (state: State) => ({
	selectedPersonName: state.room.chat.selectedPersonName,
	login: state.user.login,
	avatar: state.user.avatar,
	avatarVideo: state.user.avatar,
	hostName: state.room.persons.hostName
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
	selectPerson: (name: string) => {
		dispatch(roomActionCreators.chatPersonSelected(name));
	}
});

export function PersonView(props: PersonViewProps): JSX.Element {
	const isActive = props.account.name === props.selectedPersonName;
	const isMe = props.account.name === props.login;
	const isHost = props.account.name === props.hostName;

	const humanImage = props.account.sex === Sex.Male ? '🧑' : '👩';

	const avatar = isMe ? props.avatar : props.account.avatar;

	return (
		<li
			className={`personItem ${isActive ? 'active ' : ''} ${isMe ? 'me' : ''}`}
			onClick={() => props.selectPerson(props.account.name)}
		>
			<span title={props.account.isHuman ? localization.human : localization.computer}>
				{props.account.isHuman ? humanImage : '🖥️'}
			</span>

			<div
				className="personItem_avatar"
				style={{ backgroundImage: avatar ? `url("${avatar}")` : undefined }}
			/>

			<span>
				{props.account.name}
			</span>

			{isHost ? (<span className="personItem_host" role="img" aria-label="star" title={localization.host}>⭐</span>) : null}
		</li>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonView);
