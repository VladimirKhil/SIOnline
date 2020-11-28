import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import State from '../state/State';

import './UsersList.css';

interface UsersListProps {
	users: string[];
	login: string;
}

const mapStateToProps: MapStateToProps<UsersListProps, {}, State> = (state: State) => {
	return {
		users: state.online.users,
		login: state.user.login
	};
};

export function UsersList(props: UsersListProps) {
	const users = props.users.slice();
	users.sort((user1, user2) => user1.localeCompare(user2));

	return (
		<ul id="playersList">
			{users.map(user => (
				<li key={user} style={{ fontWeight: user === props.login ? 'bold' : 'initial' }}>{user}</li>
			))}
		</ul>
	);
}

export default connect(mapStateToProps)(UsersList);
