import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import State from '../state/State';

import './UsersList.css';

interface UsersListProps {
	users: string[];
	login: string;
}

const mapStateToProps: MapStateToProps<UsersListProps, unknown, State> = (state: State) => ({
	users: state.online.users,
	login: state.user.login,
});

export function UsersList(props: UsersListProps): JSX.Element {
	const users = props.users.slice();
	users.sort((user1, user2) => user1.localeCompare(user2));

	return (
		<ul className="playersList">
			{users.map(user => (
				<li key={user} className={user === props.login ? 'me' : ''}>{user}</li>
			))}
		</ul>
	);
}

export default connect(mapStateToProps)(UsersList);
